# PDF Service

This is a service for generating PDF files from HTML markup using Node.js and Puppeteer. The service provides an API to receive HTML content and return the generated PDF file.

## Table of Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running](#running)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Usage Examples](#usage-examples)

## Requirements

- **Node.js** v20 or higher
- **npm** v6 or higher
- **Docker** and **Docker Compose** (if you plan to run via Docker)
- **Chromium** (for the production environment)

## Installation

### Clone the repository

```bash
git clone https://github.com/oshuster/pdf-service.git
cd pdf-service
```

### Install dependencies

```bash
npm install
```

## Configuration

### `.env` file

Create a `.env` file in the root directory of the project and add the following variables:

```env
PORT=8180
ENVIRONMENT=DEVELOPMENT # or PRODUCTION
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium # Path to Chromium in production environment
```

### Puppeteer configuration

In the production environment, you need to specify the path to the system's Chromium and skip the download of the built-in Chromium:

```bash
export PUPPETEER_SKIP_DOWNLOAD=true
```

## Running

### Local run

```bash
npm start
```

Or for the development environment:

```bash
npm run dev
```

### Running with Docker

#### Build and run the container

```bash
docker-compose build
docker-compose up -d
```

#### Stop the container

```bash
docker-compose down
```

## API Endpoints

### `POST /api/pdf-service/make-pdf`

Generates a PDF file from the provided HTML markup.

#### Request body

```json
{
  "docName": "DocumentName",
  "html": "Encoded HTML markup",
  "styles": "Encoded CSS styles"
}
```

- `docName` (string, required): Name of the PDF file.
- `html` (string, required): HTML markup encoded using `encodeURIComponent`.
- `styles` (string, optional): CSS styles encoded using `encodeURIComponent`.

#### Example request

```bash
curl -X POST https://localhost.com:<PORT>/api/pdf-service/make-pdf   -H "Content-Type: application/json"   -d '{
    "docName": "F0501091",
    "html": "%3Cdiv%3EHello%2C%20world%21%3C%2Fdiv%3E",
    "styles": "%2F*%20Your%20CSS%20styles%20*%2F"
  }'
```

## Project Structure

- `/controllers` - Controllers for handling requests.
- `/middleware` - Middleware for validation and sanitization of data.
- `/helpers` - Helper functions (PDF generation, HTML validation, etc.).
- `/validators` - Joi validation schemas.
- `/routes` - Application routes.
- `/local_styles` - Local CSS styles for PDF.

## Usage Examples

### Request Validation

For validating the request body, **Joi** is used:

```javascript
import Joi from "joi"

export const pdfRequestSchema = Joi.object({
  docName: Joi.string().required(),
  html: Joi.string().required(),
  styles: Joi.string().trim().allow("").optional()
})
```

### PDF Generation

```javascript
import path from "path"
import { fileURLToPath } from "url"
import puppeteer from "puppeteer"
import "dotenv/config"
import HttpError from "./HttpError.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const localStyles = path.resolve(__dirname, "../local_styles/styles.css")
const ENVIRONMENT = process.env.ENVIRONMENT || "PRODUCTION"

export const generateBufferPDF = async ({ html, styles }) => {
  const htmlContent = decodeURIComponent(html)
  let browser

  try {
    if (ENVIRONMENT === "DEVELOPMENT") {
      browser = await puppeteer.launch()
    } else if (ENVIRONMENT === "PRODUCTION") {
      browser = await puppeteer.launch({
        executablePath:
          process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      })
    } else {
      browser = await puppeteer.launch()
    }

    const page = await browser.newPage()

    await page.setContent(htmlContent, { waitUntil: "networkidle0" })

    // Встановлення стилів
    if (styles) {
      const stylesContent = decodeURIComponent(styles)
      await page.addStyleTag({ content: stylesContent })
    } else {
      await page.addStyleTag({ path: localStyles })
    }

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" }
    })

    return pdfBuffer
  } catch (error) {
    console.error("Помилка при генерації PDF:", error)
    throw new HttpError(500, "Помилка при генерації PDF")
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}
```
