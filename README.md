# Download Manager

**Download Manager** is a Chrome extension that automatically organizes downloaded files into categorized folders based on their file types. This tool simplifies file management and ensures your downloads are always neatly organized.

## Features

- **Automatic File Categorization**: Automatically sorts files into predefined folders (e.g., Documents, Images, Videos, etc.).
- **Customizable Rules**: Add, edit, or delete rules to define how files are categorized.
- **Reset to Defaults**: Easily reset rules to their default state.
- **User-Friendly Interface**: Intuitive popup interface for managing rules.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the project folder.
5. The extension will now be available in your browser.

## Usage

1. Click on the extension icon in the Chrome toolbar.
2. Use the popup interface to:
    - Add new rules for file categorization.
    - Edit or delete existing rules.
    - Reset rules to their default state.
3. Download files, and they will be automatically saved to the appropriate folder based on the rules.

## File Structure

- `manifest.json`: Defines the extension's metadata and permissions.
- `background.js`: Contains the logic for handling downloads and applying categorization rules.
- `popup.html`: The user interface for managing rules.
- `popup.js`: Handles the functionality of the popup interface.
- `icons/`: Contains the extension's icons.

## Default Rules

The extension comes with the following default rules:

| Name         | Extensions                          | Path                     |
|--------------|-------------------------------------|--------------------------|
| 文档文件      | `.doc, .docx, .txt, .pdf`           | `/Documents`             |
| 图片文件      | `.jpg, .png, .jpeg, .gif, .webp`    | `/Images`                |
| 表格文件      | `.xls, .xlsx, .csv`                | `/Documents/Spreadsheets`|
| 压缩文件      | `.zip, .rar, .tar, .gz, .7z`       | `/Archives`              |
| 音频文件      | `.mp3, .wav, .flac, .aac`          | `/Music`                 |
| 视频文件      | `.mp4, .avi, .mkv, .mov`           | `/Videos`                |
| 代码文件      | `.js, .py, .java, .cpp, .c`        | `/Code`                  |
| 配置文件      | `.json, .xml, .yaml`               | `/Config`                |

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve this project.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

**Powered by SeapigX**