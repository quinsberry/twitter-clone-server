export interface Resp<D> {
  status: "success" | "error";
  errors?: string;
  data?: D;
}

export interface fetchResp<B> {
  status: number;
  headers?: any;
  body: B;
}
