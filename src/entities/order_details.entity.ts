import Model from "./model.entity";
import { Column, Entity, ManyToOne } from "typeorm";
import { Products } from "./product.entity";
import { Orders } from "./order.entity";

@Entity("orders_details")
export class OrdersDetails extends Model {
  @Column()
  quantity!: number;

  @ManyToOne(() => Orders, (order) => order.order_details)
  order!: Orders;

  @ManyToOne(() => Products, (product) => product.order_details)
  product!: Products;
}
