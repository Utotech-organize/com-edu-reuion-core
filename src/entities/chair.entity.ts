import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { Desk } from "./desk.entity";
import Model from "./model.entity";

@Entity("chair")
export class Chair extends Model {
  @Column({
    nullable: false,
  })
  label!: string;

  @Column({
    default: "available",
    nullable: false,
  })
  status!: string;

  @Column()
  price!: number;

  @ManyToOne(() => Desk, (desk) => desk.chair)
  @JoinColumn({ name: "desk_id" })
  desk: Desk | undefined;
}
