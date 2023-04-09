import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./model.entity";
import { Chairs } from "./chair.entity";
import { Bookings } from "./booking.entity";

@Entity("desks")
export class Desks extends Model {
  @Column({ default: true })
  active!: boolean;

  @Column({
    nullable: false,
  })
  label!: string;

  @Column({
    nullable: false,
  })
  status!: string;

  @Column({
    nullable: false,
  })
  price!: number;

  @Column({
    nullable: true,
  })
  chair_price!: number;

  @OneToMany(() => Chairs, (chair) => chair.id)
  @JoinColumn()
  chairs!: Chairs[];

  @OneToMany(() => Bookings, (booking) => booking.customer)
  bookings!: Bookings[];
}
