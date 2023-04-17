import { Column, Entity, OneToMany } from "typeorm";
import Model from "./model.entity";
import { OrdersDetails } from "./order_details.entity";

@Entity("products")
export class Products extends Model {
  @Column({ nullable: false })
  label!: string;

  @Column({ nullable: false })
  price!: number;

  @Column({ nullable: true })
  ordering!: number;

  @Column({ nullable: true })
  remark!: string;

  @Column({ nullable: false })
  active!: boolean;

  @Column({ nullable: true })
  image!: string;

  @OneToMany(() => OrdersDetails, (orderDetail) => orderDetail.product)
  order_details!: OrdersDetails[];
}
