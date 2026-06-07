#!/bin/bash
# rename-assets.sh
# Renames .JPG, .JPEG, .PNG files to lowercase extensions in assets/
# Run once from your project root: bash rename-assets.sh

cd assets || { echo "No assets/ folder found. Run from project root."; exit 1; }

count=0

for f in *; do
  # Skip directories
  [ -f "$f" ] || continue

  # Get the extension and lowercase it
  ext="${f##*.}"
  lower_ext=$(echo "$ext" | tr '[:upper:]' '[:lower:]')

  # Only act if extension has uppercase letters
  if [ "$ext" != "$lower_ext" ]; then
    base="${f%.*}"
    new_name="${base}.${lower_ext}"
    mv "$f" "$new_name"
    echo "  renamed: $f → $new_name"
    count=$((count + 1))
  fi
done

echo ""
echo "Done. $count file(s) renamed."
