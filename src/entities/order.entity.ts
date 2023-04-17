import Model from "./model.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { OrdersDetails } from "./order_details.entity";

@Entity("orders")
export class Orders extends Model {
  @Column({ nullable: true })
  remark!: string;

  @Column({ nullable: false })
  total_price!: number;

  @Column({ nullable: false }) //customer firstname
  line_liff_id!: string;

  @Column({ nullable: false }) //customer desk
  desk_label!: string;

  @Column({ nullable: true })
  status!: string;

  @OneToMany(() => OrdersDetails, (orderDetail) => orderDetail.order)
  order_details!: OrdersDetails[];
}
