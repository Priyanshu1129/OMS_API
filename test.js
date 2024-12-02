import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Simple HTML content for testing
    await page.setContent('<h1>Hello, Puppeteer PDF!</h1>', { waitUntil: 'load' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await browser.close();
    require('fs').writeFileSync('test.pdf', pdfBuffer);
    console.log('PDF generated successfully');
})();
