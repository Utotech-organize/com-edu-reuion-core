import Model from "./model.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Products } from "./product.entity";

@Entity("orders")
export class Orders extends Model {
  @Column({ nullable: false })
  label!: string;

  @Column({ nullable: true })
  remark!: string;

  @Column({ nullable: false })
  total_price!: string;

  @Column({ nullable: false }) //customer firstname
  first_name!: string;

  @Column({ nullable: false }) //customer desk
  desk_label!: string;

  @Column({
    default: true,
    nullable: true,
  })
  active!: boolean;

  @OneToMany(() => Products, (product) => product.order)
  products!: Products[];
}
