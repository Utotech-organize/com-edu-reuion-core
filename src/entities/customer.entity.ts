import { Entity, Column, Index, BeforeInsert, OneToMany } from "typeorm";
import Model from "./model.entity";
import { Chairs } from "./chair.entity";
import { Bookings } from "./booking.entity";

@Entity("customers")
export class Customers extends Model {
  @Column({
    nullable: false,
  })
  tel!: string;

  @Column({
    nullable: false,
  })
  first_name!: string;

  @Column({
    nullable: true,
  })
  last_name!: string;

  @Column({
    nullable: true,
  })
  generation!: string;

  @Column({
    nullable: true,
  })
  information!: string;

  @Column({
    nullable: false,
  })
  email!: string;

  @Column({})
  status!: string;

  @Column({
    default: "customer",
    type: String,
    nullable: false,
  })
  role!: string;

  @Index("liff_id_index")
  @Column({
    unique: true,
  })
  @Column({ nullable: true })
  line_liff_id!: string;

  @Column({ nullable: true })
  line_display_name!: string;

  @Column({ nullable: true })
  line_photo_url!: string;

  @OneToMany(() => Bookings, (booking) => booking.customer)
  bookings!: Bookings[];
}
