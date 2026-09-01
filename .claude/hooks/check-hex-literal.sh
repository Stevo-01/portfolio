#!/usr/bin/env bash
# PostToolUse/Edit|Write — flag a hardcoded colour outside the token file.
#
# tokens.css is the only file in this repo permitted to contain a hex value.
# Everything else reads var(--token). A local constant is a theme that breaks
# in light mode, and with this palette it breaks quietly: peach on off-white
# measures 2.22:1 and still looks fine on a bright screen.
#
# See AGENTS.md, "Design system" and docs/plans/DESIGN-DELTA.md.

set -uo pipefail

input="$(cat)"
f="$(printf '%s' "$input" | jq -r '.tool_input.file_path // .tool_response.filePath // ""')"

[ -n "$f" ] || exit 0
[ -f "$f" ] || exit 0

# The token layer owns every hex value in the project.
case "$f" in
  */styles/tokens.css) exit 0 ;;
esac

# Only styling surfaces. A hex in a .ts data module is usually an OG-image or
# cover-art recipe value, which has its own review path; .astro and .css are
# where a stray colour silently defeats theming.
case "$f" in
  *.astro | *.css) ;;
  *) exit 0 ;;
esac

# Fragment references are not colours, and plenty of them are all-hex:
# href="#cafe", url(#feed), xlink:href="#added". This hook blocks, so a false
# positive costs real time — strip those forms before matching. Line numbers
# survive because sed substitutes in place rather than deleting lines.
strip='s/(href|xlink:href)[[:space:]]*=[[:space:]]*.#[0-9a-zA-Z_-]*./\1=FRAGMENT/g; s/url\([[:space:]]*#[0-9a-zA-Z_-]*[[:space:]]*\)/url(FRAGMENT)/g'

# #abc, #abcd, #aabbcc, #aabbccdd. Anchored on a non-word char so an id
# selector or an entity does not match.
pattern='(^|[^&[:alnum:]_-])#[0-9a-fA-F]{3,8}([^[:alnum:]_-]|$)'

hits="$(sed -E "$strip" "$f" | grep -Ein "$pattern" | head -5 || true)"

if [ -n "$hits" ]; then
  reason="${f} contains a hardcoded colour:

${hits}

tokens.css is the only file permitted to hold a hex value — everything else reads var(--token). Two things break otherwise: the light theme (peach #FB923C scores 2.22:1 on the light background and fails AA), and --on-accent, which inverts between themes so a hardcoded value looks correct in dark and fails in light.

If the token you need does not exist, that is a request against the token layer — add it to tokens.css with both theme values, not a constant here. See docs/plans/DESIGN-DELTA.md."
  note="Hex-literal guard: hardcoded colour in ${f}"

  jq -n --arg reason "$reason" --arg note "$note" \
    '{decision: "block", reason: $reason, systemMessage: $note}'
fi

exit 0
