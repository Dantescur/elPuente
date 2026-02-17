PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_movimientos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`tipo` text NOT NULL,
	`cantidad` integer NOT NULL,
	`stock_anterior` integer NOT NULL,
	`stock_nuevo` integer NOT NULL,
	`motivo` text,
	`fecha` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_movimientos`("id", "producto_id", "tipo", "cantidad", "stock_anterior", "stock_nuevo", "motivo", "fecha") SELECT "id", "producto_id", "tipo", "cantidad", "stock_anterior", "stock_nuevo", "motivo", "fecha" FROM `movimientos`;--> statement-breakpoint
DROP TABLE `movimientos`;--> statement-breakpoint
ALTER TABLE `__new_movimientos` RENAME TO `movimientos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_productos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`costo` real NOT NULL,
	`precio_venta` real NOT NULL,
	`stock` integer NOT NULL,
	`descripcion` text,
	`stock_minimo` integer NOT NULL,
	`categoria` text NOT NULL,
	`fecha_creacion` text DEFAULT (CURRENT_TIMESTAMP),
	`fecha_actualizacion` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
INSERT INTO `__new_productos`("id", "nombre", "costo", "precio_venta", "stock", "descripcion", "stock_minimo", "categoria", "fecha_creacion", "fecha_actualizacion") SELECT "id", "nombre", "costo", "precio_venta", "stock", "descripcion", "stock_minimo", "categoria", "fecha_creacion", "fecha_actualizacion" FROM `productos`;--> statement-breakpoint
DROP TABLE `productos`;--> statement-breakpoint
ALTER TABLE `__new_productos` RENAME TO `productos`;--> statement-breakpoint
CREATE TABLE `__new_ventas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`cantidad` integer NOT NULL,
	`precio_venta` real NOT NULL,
	`ganancia` real NOT NULL,
	`fecha_venta` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_ventas`("id", "producto_id", "cantidad", "precio_venta", "ganancia", "fecha_venta") SELECT "id", "producto_id", "cantidad", "precio_venta", "ganancia", "fecha_venta" FROM `ventas`;--> statement-breakpoint
DROP TABLE `ventas`;--> statement-breakpoint
ALTER TABLE `__new_ventas` RENAME TO `ventas`;