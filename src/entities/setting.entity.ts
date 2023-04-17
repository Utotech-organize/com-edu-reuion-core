import Model from "./model.entity";
import { Column, Entity } from "typeorm";

@Entity("settings") //FIXME
export class Settings extends Model {
  @Column({ nullable: true })
  remark!: string;
}
