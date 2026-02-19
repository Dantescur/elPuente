-- CREATE TABLE `usuarios` (
-- `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
-- `username` text NOT NULL,
-- `password_hash` text NOT NULL,
-- `rol` text NOT NULL,
-- `activo` integer DEFAULT true NOT NULL,
-- `fecha_creacion` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
-- );
--> statement-breakpoint
-- CREATE UNIQUE INDEX `usuarios_username_unique` ON `usuarios` (`username`);
--> statement-breakpoint
ALTER TABLE `movimientos`
ADD `usuario_id` integer REFERENCES usuarios(id);
--> statement-breakpoint
ALTER TABLE `ventas`
ADD `usuario_id` integer REFERENCES usuarios(id);