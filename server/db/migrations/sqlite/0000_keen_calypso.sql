CREATE TABLE `movimientos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`tipo` text NOT NULL,
	`cantidad` integer NOT NULL,
	`stock_anterior` integer NOT NULL,
	`stock_nuevo` integer NOT NULL,
	`motivo` text,
	`fecha` integer NOT NULL,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `productos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`costo` real NOT NULL,
	`precio_venta` real NOT NULL,
	`stock` integer NOT NULL,
	`descripcion` text,
	`stock_minimo` integer NOT NULL,
	`categoria` text NOT NULL,
	`fecha_creacion` integer NOT NULL,
	`fecha_actualizacion` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `ventas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`producto_id` integer NOT NULL,
	`cantidad` integer NOT NULL,
	`precio_venta` real NOT NULL,
	`ganancia` real NOT NULL,
	`fecha_venta` integer NOT NULL,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
