import type { NewProduct } from '#shared/types/db'
import { db, schema } from 'hub:db';

export default defineTask({
    meta: {
        name: 'db:seed',
        description: 'Seed the database with initial data',
    },
    async run() {
        console.log('Seeding the databse');

        const products: NewProduct[] = [
            {
                nombre: 'Salchicha',
                costo: 400,
                precio_venta: 420,
                stock: 27,
                descripcion: '',
                stock_minimo: 5,
                categoria: 'Embutidos',
            },
            {
                nombre: 'Picadillo',
                costo: 490,
                precio_venta: 550,
                stock: 2,
                descripcion: '',
                stock_minimo: 3,
                categoria: 'Carne',
            }, {
                nombre: 'Refresco Luminy',
                costo: 25,
                precio_venta: 30,
                stock: 507,
                descripcion: '',
                stock_minimo: 20,
                categoria: 'Bebidas',
            },
            {
                nombre: 'Café expreso',
                costo: 1650,
                precio_venta: 1900,
                stock: 20,
                descripcion: '',
                stock_minimo: 5,
                categoria: 'Bebidas',
            },
            {
                nombre: 'Spaghetti',
                costo: 245,
                precio_venta: 300,
                stock: 19,
                descripcion: '',
                stock_minimo: 5,
                categoria: 'Pasta',
            },
            {
                nombre: 'Puré',
                costo: 350,
                precio_venta: 375,
                stock: 21,
                descripcion: '',
                stock_minimo: 5,
                categoria: 'Acompañamientos',
            },
            {
                nombre: 'Frijoles',
                costo: 770,
                precio_venta: 800,
                stock: 10,
                descripcion: '',
                stock_minimo: 3,
                categoria: 'Legumbres',
            },
            {
                nombre: 'Arroz',
                costo: 644.80,
                precio_venta: 700,
                stock: 9,
                descripcion: '',
                stock_minimo: 5,
                categoria: 'Cereales',
            },
            {
                nombre: 'Azúcar',
                costo: 592.80,
                precio_venta: 650,
                stock: 10,
                descripcion: '',
                stock_minimo: 5,
                categoria: 'Dulces',
            }
        ]

        await db.insert(schema.productos).values(products);

        return {
            result: 'Database seeded successfully',
        }

    }
})