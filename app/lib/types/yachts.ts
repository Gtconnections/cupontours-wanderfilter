export interface YachtBookingPayload {
  yachtId: string;
  yachtName: string;
  charterStart: string;
  charterEnd: string;
  totalDays: number;
  client: {
    fullName: string;
    email: string;
    phoneNumber: string;
    specialRequests: string;
  };
}

export interface YachtBookingResponse {
  success: boolean;
  message?: string;
}