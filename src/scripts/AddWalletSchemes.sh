#!/bin/bash

# Get the path to the JSON file
jsonFilePath="${SRCROOT}/../src/constants/WalletSchemes.json"

# Check if the JSON file exists
if [[ ! -f "${jsonFilePath}" ]]; then
  echo "error: JSON file not found at path ${jsonFilePath}"
  exit 1
fi

# Extract the schemes array from the JSON file
# schemes=($(jq -r '.schemes[]' "${jsonFilePath}"))
IFS=$'\n' read -d '' -r -a schemes < <(sed 's/[][]//g' "${jsonFilePath}" | tr '",' '\n' | sed '/^$/d')

# Get the Info.plist path
infoPlistPath="./${PROJECT_NAME}/Info.plist"

echo "INFO PLIST EN: ${infoPlistPath}"

# Check if the Info.plist file exists
if [[ ! -f "${infoPlistPath}" ]]; then
  echo "error: Info.plist file not found at path ${infoPlistPath}"
  exit 1
fi

# Check if the LSApplicationQueriesSchemes array exists in the Info.plist file
if ! /usr/libexec/PlistBuddy -c "Print :LSApplicationQueriesSchemes" "${infoPlistPath}" >/dev/null 2>&1; then
  # If it doesn't exist, add it to the Info.plist file
  /usr/libexec/PlistBuddy -c 'Add :LSApplicationQueriesSchemes array' "${infoPlistPath}"
fi

# Loop through each scheme in the schemes array
for scheme in "${schemes[@]}"; do
  # Check if the scheme is already present in the Info.plist file
  if /usr/libexec/PlistBuddy -c "Print :LSApplicationQueriesSchemes" "${infoPlistPath}" | grep -q -w "${scheme}"; then
    echo "warning: scheme '${scheme}' is already present in the Info.plist file"
  else
    /usr/libexec/PlistBuddy -c "Add :LSApplicationQueriesSchemes: string ${scheme}" "${infoPlistPath}"
  fi
done
