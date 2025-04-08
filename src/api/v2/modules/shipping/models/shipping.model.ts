export class ProductVariant {
    id: string;
    name: string;
    weight: number;
    quantity: number;
}

export class OrderData {
    id: string;
    user_id: string;
    name: string;
    address: string;
    province: string;
    district: string;
    ward: string;
    tel: string;
    products: ProductVariant[];
}
