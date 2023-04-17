import { Column, Entity, ManyToOne } from "typeorm";
import { Orders } from "./order.entity";
import Model from "./model.entity";

@Entity("products")
export class Products extends Model {
  @Column({ nullable: false })
  label!: string;

  @Column({ nullable: true })
  quantity!: number; // add when order by liff

  @Column({ nullable: false })
  price!: number;

  @Column({ nullable: true })
  ordering!: number;

  @Column({ nullable: true })
  remark!: string;

  @Column({ nullable: false })
  active!: boolean;

  @ManyToOne(() => Orders, (order) => order.products)
  order!: Orders;
}
