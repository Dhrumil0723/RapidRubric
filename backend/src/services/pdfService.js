const { PDFParse } = require('pdf-parse')

// Extracts plain text from a PDF buffer (pdf-parse v2 API).
async function extractText(buffer) {
  const parser = new PDFParse({ data: new Uint8Array(buffer) })
  const { text } = await parser.getText()
  return (text ?? '').trim()
}

module.exports = { extractText }
