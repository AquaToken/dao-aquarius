import * as React from 'react';
import { useCallback, useState } from 'react';
import Cropper from 'react-easy-crop';
import styled from 'styled-components';

import { ModalProps } from 'types/modal';

import { Button } from 'basics/buttons';
import { ModalTitle, ModalWrapper } from 'basics/ModalAtoms';

const CropperWrapper = styled.div`
    position: relative;
    height: 50rem;
    margin: 3.2rem 0;
`;

type Area = {
    x: number;
    y: number;
    width: number;
    height: number;
};

function getCroppedImg(imageSrc: string, croppedAreaPixels: Area): Promise<string> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = 'anonymous'; // important for cross-origin images

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = croppedAreaPixels.width;
            canvas.height = croppedAreaPixels.height;
            const ctx = canvas.getContext('2d');

            if (!ctx) return reject('Canvas context is null');

            ctx.drawImage(
                image,
                croppedAreaPixels.x,
                croppedAreaPixels.y,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
                0,
                0,
                croppedAreaPixels.width,
                croppedAreaPixels.height,
            );

            const base64Image = canvas.toDataURL('image/jpeg');
            resolve(base64Image);
        };

        image.onerror = error => {
            reject(error);
        };
    });
}

interface Params {
    imageSrc: string;
}

const CropperModal = ({ params, confirm }: ModalProps<Params>) => {
    const { imageSrc } = params;

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropComplete = useCallback((_: Area, croppedArea: Area) => {
        setCroppedAreaPixels(croppedArea);
    }, []);

    const apply = useCallback(async () => {
        if (!imageSrc || !croppedAreaPixels) return;

        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            confirm({ croppedImage });
        } catch (e) {
            console.error('Crop error:', e);
        }
    }, [imageSrc, croppedAreaPixels]);

    return (
        <ModalWrapper>
            <ModalTitle>Crop your image</ModalTitle>
            <CropperWrapper>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </CropperWrapper>
            <Button isBig fullWidth onClick={() => apply()}>
                APPLY
            </Button>
        </ModalWrapper>
    );
};

export default CropperModal;
