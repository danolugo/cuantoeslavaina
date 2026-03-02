const { Agent, fetch } = require('undici');

async function testTLS() {
    const url = 'https://www.bcv.org.ve/';

    console.log(`Testing standard fetch to ${url}...`);
    try {
        await fetch(url);
        console.log('Standard fetch succeeded.');
    } catch (err) {
        console.log('Standard fetch failed:');
        console.log(err.message, err.cause);
    }

    console.log(`\nTesting fetch with custom dispatcher to ${url}...`);
    try {
        const dispatcher = new Agent({
            connect: { rejectUnauthorized: false }
        });
        const res = await fetch(url, { dispatcher });
        console.log(`Scoped fetch succeeded with status ${res.status}`);
    } catch (err) {
        console.log('Scoped fetch failed:');
        console.log(err.message);
    }
}

testTLS();
