Endpoints

## users

### `users.getCurrent` (query)
Devuelve el documento del usuario autenticado o `null` si no hay sesión.

### `users.getById` (query)
Recibe `userId` y devuelve el documento del usuario público o `null`.

### `users.updateProfile` (mutation)
Actualiza los datos del perfil del usuario autenticado (`name`, `phone`, `bio`, `avatar`, `licenseNumber`, `specialty`, `clinicName`). Devuelve `userId`.


## pets

### `pets.create` (mutation)
Crea un pet con los datos recibidos (`name`, `sex`, `species`, `breed?`, `birthDate?`, `photo?`, `condition?`, `collarId?`) y registra al usuario autenticado como owner `primary`. Devuelve `petId`.

### `pets.update` (mutation)
Actualiza los campos editables de un pet. Recibe `petId` y campos parciales; valida que el usuario sea owner. Devuelve `petId`.

### `pets.remove` (mutation)
Elimina el pet y todos sus datos asociados (`petOwners`, `petRecords`, `medications`, `medicationLogs`, `collarReadings`, `vetPatients`). Solo el owner `primary` puede ejecutarlo. Devuelve `null`.

### `pets.getById` (query)
Recibe `petId` y devuelve el pet con la `photoUrl` resuelta desde `_storage`, o `null` si no existe.

### `pets.listByUser` (query)
Recibe `userId` y devuelve la lista de pets asociados a ese usuario a través de `petOwners`, incluyendo el role del usuario en cada pet.

### `pets.listMine` (query)
Devuelve los pets del usuario autenticado, con `photoUrl` resuelta y role del owner.

### `pets.addOwner` (mutation)
Agrega un owner adicional a un pet. Recibe `petId`, `userId` y `role`; requiere ser owner `primary`. Devuelve `petOwnerId`.

### `pets.removeOwner` (mutation)
Quita un owner de un pet. Recibe `petId` y `userId`; requiere ser owner `primary` y no permite eliminar al último primary. Devuelve `null`.

### `pets.listOwners` (query)
Recibe `petId` y devuelve los owners del pet con su información de usuario y role.

---

## petRecords

### `petRecords.create` (mutation)
Registra una entrada de seguimiento del pet (peso, temperatura, comportamiento, etc.). Recibe `petId`, `type`, `title`, `description?`, `value?`, `unit?`, `date`. Devuelve `recordId`.

### `petRecords.update` (mutation)
Actualiza los datos de un registro existente. Recibe `recordId` y campos parciales. Devuelve `recordId`.

### `petRecords.remove` (mutation)
Elimina un registro del pet. Recibe `recordId`. Devuelve `null`.

### `petRecords.listByPet` (query)
Recibe `petId`, `type?` y `paginationOpts`. Devuelve los registros del pet ordenados por `date` desc, con datos del autor.

### `petRecords.getById` (query)
Recibe `recordId` y devuelve el registro o `null`.

---

## medications

### `medications.create` (mutation)
Crea un medicamento activo para un pet con su dosis y frecuencia. Recibe `petId`, `name`, `purpose`, `dosage`, `frequencyValue`, `frequencyUnit`, `startDate`, `endDate?`, `notes?`, `prescribedBy?`. Devuelve `medicationId`.

### `medications.update` (mutation)
Actualiza los datos de un medicamento. Recibe `medicationId` y campos parciales. Devuelve `medicationId`.

### `medications.setActive` (mutation)
Activa o desactiva un medicamento sin eliminarlo, útil para pausar tratamientos. Recibe `medicationId` y `active`. Devuelve `medicationId`.

### `medications.remove` (mutation)
Elimina el medicamento y todos sus `medicationLogs` asociados. Recibe `medicationId`. Devuelve `null`.

### `medications.listByPet` (query)
Recibe `petId` y `activeOnly?`. Devuelve los medicamentos del pet, con datos del prescriptor si aplica.

### `medications.getById` (query)
Recibe `medicationId` y devuelve el medicamento o `null`.

### `medications.listPrescribedByVet` (query)
Recibe `vetId` y `paginationOpts`. Devuelve los medicamentos que ese vet ha prescrito, con datos del pet.

---

## medicationLogs

### `medicationLogs.log` (mutation)
Registra que una dosis fue administrada o saltada. Recibe `medicationId`, `administeredAt`, `skipped` y `skipReason?`. Devuelve `logId`.

### `medicationLogs.remove` (mutation)
Elimina un log de medicamento previamente creado. Recibe `logId`. Devuelve `null`.

### `medicationLogs.listByMedication` (query)
Recibe `medicationId` y `paginationOpts`. Devuelve los logs ordenados por `administeredAt` desc.

### `medicationLogs.listByPet` (query)
Recibe `petId`, `from?` y `to?`. Devuelve los logs del pet en el rango de fechas dado, útil para construir el historial diario.

---

## collarReadings

### `collarReadings.ingest` (mutation)
Punto de entrada para los datos del collar. Recibe `collarId`, `type`, `value`, `unit`, `latitude?`, `longitude?` y `timestamp`; resuelve el `petId` a partir del `collarId`. Devuelve `readingId`.

### `collarReadings.listByPet` (query)
Recibe `petId`, `type?`, `from?`, `to?` y `paginationOpts`. Devuelve las lecturas del collar ordenadas por `timestamp` desc, útil para series temporales.

### `collarReadings.latest` (query)
Recibe `petId` y `type`. Devuelve la lectura más reciente de ese tipo o `null`, pensado para mostrar el valor actual en el dashboard.

### `collarReadings.latestLocation` (query)
Recibe `petId` y devuelve la última lectura de tipo `location` con sus coordenadas, o `null`.



## forumPosts

### `forumPosts.create` (mutation)
Crea un post en el foro asociado al usuario autenticado. Recibe `title`, `content`, `category`, `species?`. Devuelve `postId`.

### `forumPosts.update` (mutation)
Actualiza el contenido o categorización de un post propio. Recibe `postId`, `title?`, `content?`, `category?`, `species?`. Devuelve `postId`.

### `forumPosts.remove` (mutation)
Elimina el post junto con sus comments y likes. Recibe `postId`; permitido al autor. Devuelve `null`.

### `forumPosts.getById` (query)
Recibe `postId` y devuelve el post con datos del autor y `likedByMe`, o `null`.

### `forumPosts.list` (query)
Recibe `category?`, `species?` y `paginationOpts`. Devuelve los posts paginados ordenados por fecha desc, con los `pinned` arriba.

### `forumPosts.search` (query)
Recibe `query` y `category?`. Usa el search index para devolver posts cuyo título coincida.

### `forumPosts.listByUser` (query)
Recibe `userId` y `paginationOpts`. Devuelve los posts creados por ese usuario.

---

## forumComments

### `forumComments.create` (mutation)
Crea un comentario o respuesta en un post; marca `isExpertAnswer` si el autor es `expert` e incrementa `totalComments` del post. Recibe `postId`, `content` y `parentCommentId?`. Devuelve `commentId`.

### `forumComments.update` (mutation)
Actualiza el contenido de un comentario propio. Recibe `commentId` y `content`. Devuelve `commentId`.

### `forumComments.remove` (mutation)
Elimina el comentario, sus replies y likes asociados, y decrementa `totalComments` del post. Recibe `commentId`. Devuelve `null`.

### `forumComments.listByPost` (query)
Recibe `postId` y `paginationOpts`. Devuelve los comentarios raíz del post con autor y `likedByMe`.

---

## forumLikes

### `forumLikes.togglePostLike` (mutation)
Alterna el like del usuario autenticado sobre un post y actualiza `totalLikes`. Recibe `postId`. Devuelve `liked` (boolean).

### `forumLikes.toggleCommentLike` (mutation)
Alterna el like del usuario autenticado sobre un comentario. Recibe `commentId`. Devuelve `liked` (boolean).

---

## upload

### `upload.generateUploadUrl` (mutation)
Genera una URL temporal firmada para subir un archivo a `_storage` desde el cliente. Devuelve la URL.

### `upload.getUrl` (query)
Recibe `storageId` y devuelve la URL pública del archivo o `null` si no existe.
