import { APIRequestContext } from "@playwright/test";

export default class ListingLatest {
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async getReq(endpoint: string) {
    const res = await this.request.get(endpoint, {
      params: {
        start: '1',   // Starting rank
        limit: '10',  // Limit to 10 cryptocurrencies
        convert: 'USD' // Convert prices to USD
      }
    });
    return res
  }
}