import Model from "./model.entity";
import { Column, Entity } from "typeorm";

@Entity("gallery")
export class Gallery extends Model {
  @Column({ nullable: false })
  image!: string;

  @Column({ nullable: false })
  line_display_name!: string;

  @Column({ nullable: false })
  line_photo_url!: string;

  @Column({
    nullable: false,
  })
  status!: string;

  @Column({ nullable: false })
  first_name!: string;

  @Column({ nullable: false })
  generation!: string;
}
