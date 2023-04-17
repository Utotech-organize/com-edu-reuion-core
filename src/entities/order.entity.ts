import Model from "./model.entity";
import { Column, Entity, OneToMany } from "typeorm";
import { Products } from "./product.entity";

@Entity("orders")
export class Orders extends Model {
  @Column({ nullable: true })
  remark!: string;

  @Column({ nullable: false })
  total_price!: string;

  @Column({ nullable: false }) //customer firstname
  line_liff_id!: string;

  @Column({ nullable: false }) //customer desk
  desk_label!: string;

  @OneToMany(() => Products, (product) => product.order)
  products!: Products[];
}
