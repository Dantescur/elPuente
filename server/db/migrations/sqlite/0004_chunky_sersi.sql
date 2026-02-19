PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_movimientos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`tipo` text NOT NULL,
	`cantidad` integer NOT NULL,
	`stock_anterior` integer NOT NULL,
	`stock_nuevo` integer NOT NULL,
	`motivo` text,
	`fecha` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_movimientos`("id", "producto_id", "tipo", "cantidad", "stock_anterior", "stock_nuevo", "motivo", "fecha") SELECT "id", "producto_id", "tipo", "cantidad", "stock_anterior", "stock_nuevo", "motivo", "fecha" FROM `movimientos`;--> statement-breakpoint
DROP TABLE `movimientos`;--> statement-breakpoint
ALTER TABLE `__new_movimientos` RENAME TO `movimientos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_movimientos_producto` ON `movimientos` (`producto_id`);--> statement-breakpoint
CREATE INDEX `idx_movimientos_fecha` ON `movimientos` (`fecha`);--> statement-breakpoint
CREATE TABLE `__new_productos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`costo` integer NOT NULL,
	`precio_venta` integer NOT NULL,
	`stock` integer NOT NULL,
	`descripcion` text,
	`stock_minimo` integer NOT NULL,
	`categoria` text NOT NULL,
	`activo` integer DEFAULT true NOT NULL,
	`fecha_creacion` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
	`fecha_actualizacion` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
	`fecha_eliminacion` text
);
--> statement-breakpoint
INSERT INTO `__new_productos`("id", "nombre", "costo", "precio_venta", "stock", "descripcion", "stock_minimo", "categoria", "activo", "fecha_creacion", "fecha_actualizacion", "fecha_eliminacion") SELECT "id", "nombre", "costo", "precio_venta", "stock", "descripcion", "stock_minimo", "categoria", "activo", "fecha_creacion", "fecha_actualizacion", "fecha_eliminacion" FROM `productos`;--> statement-breakpoint
DROP TABLE `productos`;--> statement-breakpoint
ALTER TABLE `__new_productos` RENAME TO `productos`;--> statement-breakpoint
CREATE INDEX `categoria_idx` ON `productos` (`categoria`);--> statement-breakpoint
CREATE TABLE `__new_ventas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`cantidad` integer NOT NULL,
	`precio_venta` integer NOT NULL,
	`ganancia` integer NOT NULL,
	`fecha_venta` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_ventas`("id", "producto_id", "cantidad", "precio_venta", "ganancia", "fecha_venta") SELECT "id", "producto_id", "cantidad", "precio_venta", "ganancia", "fecha_venta" FROM `ventas`;--> statement-breakpoint
DROP TABLE `ventas`;--> statement-breakpoint
ALTER TABLE `__new_ventas` RENAME TO `ventas`;--> statement-breakpoint
CREATE INDEX `idx_ventas_producto` ON `ventas` (`producto_id`);--> statement-breakpoint
CREATE INDEX `idx_ventas_fecha` ON `ventas` (`fecha_venta`);