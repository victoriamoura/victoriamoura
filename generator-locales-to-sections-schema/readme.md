# Shopify Sections Schema Locales Generator

This is a tool to generate basic locales JSON for section schemas from Shopify themes. It allows you to easily translate the content of your schema and create corresponding locales for your Shopify theme.

## How to Use

1. Open the application by accessing the `index.html` file in a web browser.

2. In the provided text area, insert the schema JSON without the liquid tag `{% schema %}`.

3. Click the "Generate" button to process the input and generate translated schema and locales.

4. The generated schema and locales will be displayed in the respective sections.

5. Click the "Copy Code" button to copy the generated code to your clipboard.

## Understanding the Code

The application is built using HTML, CSS (Bootstrap 4.3.1), and JavaScript. The core functionality is in the `app.js` file, which includes the translation logic and code to handle copying to the clipboard.

The translation process involves parsing the input JSON, identifying the main key (e.g., 'name' or 'class'), and generating a translated schema along with locales.

## Code Structure

- `index.html`: The main HTML file that includes the structure of the web page.
- `app.js`: Contains the JavaScript code for processing and translating the schema.

## Functionality

- **Translation Logic**: The `traduzir` function reads the input JSON, identifies the main key, and translates the schema and locales.
- **Copying to Clipboard**: The `copyCode` function enables copying the generated code to the clipboard with a button click.
- **Chave Ignoradas**: Certain keys, defined in `ignorarChave`, are ignored during the translation process.

## Sample Workflow

1. **Insert Schema**: Paste your schema JSON in the provided textarea.
2. **Generate**: Click the "Generate" button to trigger the translation process.
3. **Copy Code**: Copy the generated schema or locales using the "Copy Code" button for each.

## Credits

- **Author**: Victoria Moura
- **Powered by**: ChatGPT

## Issues and Contributions

If you encounter any issues or would like to contribute to the project, please open an issue or submit a pull request on the GitHub repository.

**© 2024 Victoria Moura. All rights reserved.**