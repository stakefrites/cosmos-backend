import axios from "axios";

export class Price {
    baseUrl: string;
    version: string;
    constructor() {
        this.baseUrl = "https://api.coingecko.com/api/";
        this.version = "v3/";
    }
    async getPrice(id: string) {
        try {
        const response = await axios.get(
            this.baseUrl + this.version + "simple/price",
            {
            params: {
                ids: id,
                vs_currencies: "usd,cad,eur",
            },
            }
        );
        if (response.status == 200 && response.data[id]) {
            return response.data;
        } else {
            return { [id]: false };
        }
        } catch (error: any) {
        console.log(error.message);
        }
    }
    async get14DaysMarketChartByCurrency(id: string, currency: string) {
        try {
        const response = await axios.get(
            this.baseUrl + this.version + id + "/market_chart",
            {
            params: {
                vs_currency: currency,
                days: 14,
                interval: "daily",
            },
            }
        );
        return response.data;
        } catch (error: any) {
        console.log(error.message);
        }
    }
}