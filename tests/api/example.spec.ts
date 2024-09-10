import { test, expect, request, APIRequestContext } from '@playwright/test';
import ListingLatest from '../../api-services/listing-latest.api';

// Define the base URL and your CoinMarketCap API Key
const BASE_URL = 'https://pro-api.coinmarketcap.com';
const API_KEY = 'your_coinmarketcap_api_key'; // replace with your API key

test.describe('CoinMarketCap API Tests', () => {

  // Set up a request object for making API calls
  let apiContext: APIRequestContext;

  test.beforeAll(async () => {
    apiContext = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'X-CMC_PRO_API_KEY': 'fe7590bc-4f98-4fb8-9de7-abe05313df2d'
      }
    });
  });

  test('Validate status and response of the latest cryptocurrency listings', async () => {
    // do a service factory to init all the services(api endpoints)
    const api = new ListingLatest(apiContext);
    const response = await api.getReq('/v1/cryptocurrency/listings/latest');

    // Check if the status code is 200 (OK)
    expect(response.status()).toBe(200);

    // Parse the response
    const responseData = await response.json();

    // Validate the structure of the data
    expect(responseData).toHaveProperty('data');
    expect(Array.isArray(responseData.data)).toBe(true);

    // Check that at least one cryptocurrency has a symbol and name
    const firstCrypto = responseData.data[0];
    expect(firstCrypto).toHaveProperty('name');
    expect(firstCrypto).toHaveProperty('symbol');
    expect(firstCrypto.quote).toHaveProperty('USD');

    // Validate that the first cryptocurrency has a valid price
    const usdQuote = firstCrypto.quote.USD;
    expect(usdQuote).toHaveProperty('price');
    expect(typeof usdQuote.price).toBe('number');
  });

  test('Verify the data for a specific cryptocurrency - Bitcoin', async () => {
    const response = await apiContext.get('/v1/cryptocurrency/listings/latest', {
      params: {
        start: '1',
        limit: '10',
        convert: 'USD'
      }
    });

    // Check if the status code is 200 (OK)
    expect(response.status()).toBe(200);

    // Parse the response
    const responseData = await response.json();

    // Find Bitcoin in the list
    const bitcoin = responseData.data.find((crypto: any) => crypto.symbol === 'BTC');
    expect(bitcoin).toBeTruthy(); // Ensure Bitcoin exists in the result

    // Validate Bitcoin's name and symbol
    expect(bitcoin.name).toBe('Bitcoin');
    expect(bitcoin.symbol).toBe('BTC');

    // Validate Bitcoin has a price in USD
    const usdQuote = bitcoin.quote.USD;
    expect(usdQuote).toHaveProperty('price');
    expect(typeof usdQuote.price).toBe('number');
  });

  test('Validate handling of invalid requests', async () => {
    const response = await apiContext.get('/v1/cryptocurrency/listings/latest', {
      params: {
        start: '0',   // Invalid starting rank (must be 1 or more)
        limit: '10',
        convert: 'USD'
      }
    });

    // Check that the API returns a 400 Bad Request for invalid parameters
    expect(response.status()).toBe(400);

    // Parse the response and validate the error message
    const responseData = await response.json();
    expect(responseData).toHaveProperty('status');
    expect(responseData.status.error_code).toBeGreaterThan(0); // Indicates an error
    expect(responseData.status.error_message).toBeTruthy();
  });
});
