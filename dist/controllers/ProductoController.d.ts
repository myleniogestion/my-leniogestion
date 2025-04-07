import { Response, Request } from "express";
import { ProductoService } from "../services/ProductoService";
import { TiendaService } from "../services/TiendaService";
export declare class ProductoController {
    private readonly productoService;
    private readonly tiendaService;
    constructor(productoService?: ProductoService, tiendaService?: TiendaService);
    createProducto(req: Request, res: Response): Promise<void>;
    getProducto(req: Request, res: Response): Promise<void>;
    getProductoById(req: Request, res: Response): Promise<void>;
    updateProducto(req: Request, res: Response): Promise<void>;
    deleteProducto(req: Request, res: Response): Promise<void>;
    getAllImages(req: Request, res: Response): Promise<void>;
    filtrarProducto(req: Request, res: Response): Promise<void>;
    OrdenarProductos(req: Request, res: Response): Promise<void>;
    AgregarTiendaAProducto(req: Request, res: Response): Promise<void>;
    DeleteAllTiendasinProducto(req: Request, res: Response): Promise<void>;
    HacerExcel(req: Request, res: Response): Promise<void>;
    ImportarExcel(req: Request, res: Response): Promise<void>;
    findbySku(req: Request, res: Response): Promise<void>;
    getAllPaginated(req: Request, res: Response): Promise<void>;
    HacerExcelwithColumns(req: Request, res: Response): Promise<void>;
    machearProducto(req: Request, res: Response): Promise<void>;
}
