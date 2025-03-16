import { DeleteResult, UpdateResult } from "typeorm";
import { BaseService } from "../config/base.service";
import { EntradaDto } from "../DTO/EntradaDto";
import { Entrada } from "../entities/Entrada";

export class EntradaService extends BaseService<Entrada> {
   
    constructor(){
        super(Entrada);
    }
	// servicio para obtener todos los Entradas

    async findAllEntradas():Promise<Entrada[]> {
        return (await this.execRepository).find({relations:["proveedor","producto","tienda"]});
    }
    async findEntradaById(id_entrada: number): Promise<Entrada | null> {
        return (await this.execRepository)
        .createQueryBuilder("e")
        .leftJoinAndSelect("e.proveedor","p")
        .leftJoinAndSelect("e.producto","prod")
        .leftJoinAndSelect("e.tienda","t")
        .where("e.id_entrada=:id_entrada",{id_entrada})
        .getOne();
      }
    // servicio para crear un Entradas
 async createEntrada(body: EntradaDto): Promise<Entrada>{
        return (await this.execRepository).save(body);
    }

    async deleteEntrada(id: number): Promise<DeleteResult>{
        return (await this.execRepository).delete(id);
    }
    // actualizar un Entradas
   async updateEntrada(id: number, infoUpdate: EntradaDto): Promise<UpdateResult>{
    return (await this.execRepository).update(id, infoUpdate);
    }

    async getAllEntradasbyProveedor(id_proveedor:number){
        return(await this.execRepository)
        .createQueryBuilder("e")
        .leftJoinAndSelect("e.proveedor","p")
        .leftJoinAndSelect("e.producto","prod")
        .where("e.id_proveedor=:id_proveedor",{id_proveedor})
        .getMany();
    }
    /*
    nombre del prooveedor
    nombre producto
    rango de costo
    rango de fecha
    */
   async filtrarEntradas(nombre_proveedor:string|null,nombre_producto:string|null,costoliminf:number|null,costolimsup:number|null,fechaliminf:Date|null,fechalimsup:Date|null){
    let entradas:Entrada[]=[]
    const normalizeString = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    if(fechaliminf && fechalimsup){
        entradas=await(await this.execRepository)
        .createQueryBuilder("e")
        .leftJoinAndSelect("e.proveedor","p")
        .leftJoinAndSelect("e.producto","prod")
        .where("e.fecha>=:fechaliminf and e.fecha<=:fechalimsup",{fechaliminf,fechalimsup})
        .getMany();
        console.log(entradas);
        
    }else
    if(fechaliminf){
    entradas=await(await this.execRepository)
    .createQueryBuilder("e")
    .leftJoinAndSelect("e.proveedor","p")
    .leftJoinAndSelect("e.producto","prod")
    .where("e.fecha>=:fechaliminf",{fechaliminf})
    .getMany();
}else if(fechalimsup){
    entradas=await(await this.execRepository)
    .createQueryBuilder("e")
    .leftJoinAndSelect("e.proveedor","p")
    .leftJoinAndSelect("e.producto","prod")
    .where("e.fecha<=:fechalimsup",{fechalimsup})
    .getMany();
}   else{
        entradas=await(await this.execRepository).find({relations:["proveedor","producto"]})
        }

    if(nombre_proveedor){
        const normalizedNombre_proveedor=  normalizeString(nombre_proveedor);
        entradas=entradas.filter((entrada:Entrada)=>normalizeString(entrada.proveedor.nombre).includes(normalizedNombre_proveedor));
    }
    if(nombre_producto){
        const normalizedNombre_producto=  normalizeString(nombre_producto);
        entradas=entradas.filter((entrada:Entrada)=>normalizeString(entrada.producto.nombre).includes(normalizedNombre_producto));
    }
    if(costoliminf)
        entradas=entradas.filter((entrada:Entrada)=>entrada.costo>=costoliminf)
    if(costolimsup)
        entradas=entradas.filter((entradas:Entrada)=>entradas.costo<=costolimsup)
    
    return entradas;
   }

   async EntradasbyProducto(id_producto:number){
    return await(await this.execRepository)
    .createQueryBuilder("e")
    .leftJoinAndSelect("e.producto","p")
    .leftJoinAndSelect("e.proveedor","prov")
    .where("p.id_producto=:id_producto",{id_producto})
    .getMany();
   }
}
