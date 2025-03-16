import { Response,Request } from "express";
import { ProductoService } from "../services/ProductoService";
import { OrdenarProducto } from "../helpers/Ordenar_criterios";
import * as XLSX from 'xlsx';

export class ProductoController{
    constructor(private readonly productoService:ProductoService=new ProductoService()){
    
    }
    async createProducto(req: Request, res: Response){
        try {
    const data = await this.productoService.createProducto (req.body);
            res.status(200).json(data);
        } catch (e:any) {
            res.status(500).json({"error":e.message});            
        }
    }
    
    async getProducto(req: Request, res: Response){
        try {
          const data = await this.productoService.findAllProducto();
            res.status(200).json(data);
        } catch (e:any) {
            res.status(500).json({"error":e.message});            
        }
    }
    async getProductoById(req: Request, res: Response){
        const {ID} = req.params;
        try {
      const data = await this.productoService.findProductoById(parseInt(ID));
      if(data)
        res.status(200).json(data);
    else
        res.status(404).json();
        } catch (e:any) {
            res.status(500).json({"error":e.message});            
        }
    }
    async updateProducto(req: Request, res: Response){
        const {ID} = req.params;
        try {
            const data = await this.productoService.updateProducto(parseInt(ID), req.body);
            res.status(200).json(data);
        } catch (e:any) {
            res.status(500).json({"error":e.message});            
        }
    }
    async deleteProducto(req: Request, res: Response){
        const {ID} = req.params;
        try {
            const data = await this.productoService.deleteProducto(parseInt(ID));
            res.status(200).json(data);
        } catch (e:any) {
            res.status(500).json({"error":e.message});            
        }
    }
    async getAllImages(req:Request, res:Response){
        const{ID}=req.params;
        try{
            console.log(ID)
            const data=await this.productoService.getAllimagenesProductobyId(parseInt(ID))
            if(data)
            res.status(200).json(data)
            else
            res.status(404).json("No encontraron las fotos")
        }catch(e:any){
            res.status(500).json({"error":e.message})
        }
        }
        async filtrarProducto(req:Request,res:Response){
            const{nombre,sku,precio_liminf,precio_limsup,id_tienda,cantidad}=req.body
            console.log(nombre,sku,precio_liminf,precio_limsup,id_tienda)
               try {
                   const data=await this.productoService.filtrarProducto(nombre,sku,precio_liminf,precio_limsup,id_tienda,cantidad)
                    if(data){
                        res.status(200).json(data)
                    }else
                    res.status(404).json(data)
                
               } catch (error:any) {
                console.log(error.message)
            } 
        }
        async OrdenarProductos(req:Request,res:Response){

            let{items,criterio,ascendente}=req.body
            try {
                console.log(typeof(ascendente))
                const data=await OrdenarProducto(ascendente,items,criterio);
                (data)?res.status(200).json(data):res.status(404).json("no se puede ordenar");
            } catch (error:any) {
                res.status(500).json({"error":error.message})
            }
        }
        async AgregarTiendaAProducto(req:Request,res:Response){
            const{id_tienda,id_producto}=req.body;
            try {
                const data=await this.productoService.agregarTienda(parseInt(id_producto),parseInt(id_tienda));
                (data)?res.status(200).json(data):res.status(404).json("Producto no encontrado");
            } catch (error:any) {
                res.status(500).json({"error":error.message})
                
            }
        }
        async DeleteAllTiendasinProducto(req:Request,res:Response){
            try {
              await this.productoService.DeleteAllTiendasinProducto();
                res.status(200).json(true);
            } catch (error:any) {
                res.status(500).json({"error":error.message})

            }
        }
        async HacerExcel(req: Request, res: Response) {
            const { productos } = req.body;
            try {
                const worksheet = XLSX.utils.json_to_sheet(productos);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
        
                const date: Date = new Date();
                const str: string = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        
                const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
                res.setHeader('Content-Disposition', `attachment; filename=productos-${str}.xlsx`);
                res.setHeader('Content-Type', 'application/octet-stream');
                res.send(excelBuffer);
            } catch (error: any) {
                res.status(500).json({ "error": error.message });
            }
        }
        async ImportarExcel(req:Request,res:Response){
            const {path}=req.body;
            try {
                const data=await this.productoService.procesarExcel(path);
                res.status(200).json(data);
            } catch (error:any) {
                res.status(500).json({ "error": error.message });
                
            };
        }
        async findbySku(req:Request,res:Response){
            const {sku}=req.params;
            try {
                const data=await this.productoService.findbySku(sku);
                (data)?res.status(200).json(data):res.status(404).json("No se encontro");
            } catch (error:any) {
                res.status(500).json({ "error": error.message });
            }
        }
        async getAllPaginated(req:Request,res:Response){
            const {page}=req.params;
            try {
                const data=await this.productoService.getAllPaginated(parseInt(page));
                (data)?res.status(200).json(data):res.status(404).json("Data not found")
            } catch (error:any) {
                res.status(500).json({ "error": error.message });
            }
        }
        
 async HacerExcelwithColumns(req: Request, res: Response) {
    const { productos, columns } = req.body;
    try {
        // Crear una hoja de trabajo desde productos y aplicar las columnas
        const worksheet = XLSX.utils.json_to_sheet(productos, { header: columns });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');

        const date: Date = new Date();
        const str: string = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', `attachment; filename=productos-${str}.xlsx`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(excelBuffer);
    } catch (error: any) {
        res.status(500).json({ "error": error.message });
    }
}

    }