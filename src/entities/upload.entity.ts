import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import Model from "./model.entity";

/* It's a class that extends the Model class from the typeorm package. It has two
properties: url and type. The url property is a string that defaults to and the type property is a string that defaults to "unknow" */
@Entity("our_files")
export class OurFile extends Model {
  @Column({ default: true })
  active!: boolean;

  @Column({ nullable: false })
  url!: string;

  @Column({ nullable: false })
  label!: string;

  @Column({
    nullable: false,
    default: "unknow",
  })
  type!: string;
}
