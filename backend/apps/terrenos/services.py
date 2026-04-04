import logging

import cloudinary.uploader


logger = logging.getLogger(__name__)


class TerrainImageServiceError(Exception):
    pass


def upload_terrain_image(*, file, folder: str) -> dict:
    try:
        return cloudinary.uploader.upload(
            file,
            folder=folder,
            resource_type="image",
        )
    except Exception as exc:
        logger.exception("Fallo la subida de imagen a Cloudinary en folder=%s.", folder)
        raise TerrainImageServiceError(
            "No se pudo subir una de las imagenes a Cloudinary."
        ) from exc


def delete_terrain_image(*, cloudinary_id: str) -> None:
    if not cloudinary_id:
        return

    try:
        cloudinary.uploader.destroy(cloudinary_id, resource_type="image")
    except Exception as exc:
        logger.exception(
            "Fallo la eliminacion de imagen en Cloudinary para public_id=%s.",
            cloudinary_id,
        )
        raise TerrainImageServiceError(
            "No se pudo eliminar la imagen en Cloudinary."
        ) from exc
