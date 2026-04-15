export interface FlightDeal {
  destination: string;
  price: string;
  departureDate: string;
}

export interface TransportData {
  tripType?: string;
  departureIata?: string;
  destinationIata?: string;
  bestTransport?: string;
  weatherInsight?: string;
  flights?: FlightDeal[];
}
