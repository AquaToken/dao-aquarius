import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';

import { ModalService } from 'services/globalServices';

import { flexColumnCenter } from 'web/mixins';
import CropperModal from 'web/modals/CropperModal';
import { COLORS, FONT_SIZE } from 'web/styles';

import Icon from 'assets/icon-withdraw.svg';

import ExternalLink from 'basics/ExternalLink';

const Container = styled.div`
    position: relative;
    border-radius: 0.5rem;
    border: 0.1rem dashed ${COLORS.gray};
    padding: 6rem 0;
    gap: 1.6rem;
    ${FONT_SIZE.md};
    ${flexColumnCenter};
    color: ${COLORS.grayText};
`;

const Label = styled.div`
    position: absolute;
    bottom: calc(100% + 1.2rem);
    left: 0;
    ${FONT_SIZE.md};
    line-height: 1.8rem;
    color: ${COLORS.paragraphText};
`;

const Preview = styled.img`
    height: 6.4rem;
`;

const StyledInput = styled.input`
    bottom: 0;
`;

interface Props {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

const ImageInput = ({ label, onChange, required, value, ...props }: Props) => {
    const [image, setImage] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        setImage(file);

        const reader = new FileReader();
        reader.onload = () => {
            onChange(reader.result as string);

            ModalService.openModal(CropperModal, { imageSrc: reader.result }).then(
                ({ isConfirmed, croppedImage }) => {
                    if (!isConfirmed) return;
                    onChange(croppedImage);
                },
            );
        };
        reader.readAsDataURL(file);
    }, []);

    const inputRef = useRef<HTMLInputElement>(null);

    const {
        getRootProps,
        getInputProps,
        inputRef: dropzoneRef,
    } = useDropzone({
        onDrop,
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg', '.jpg'],
        },
        multiple: false,
    });

    const typedDropzoneRef = dropzoneRef as
        | ((instance: HTMLInputElement | null) => void)
        | React.RefObject<HTMLInputElement>
        | undefined;

    useEffect(() => {
        if (value) return;

        setImage(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }, [value]);

    return (
        <Container {...getRootProps()} {...props}>
            {Boolean(label) && <Label>{label}</Label>}
            {image ? (
                <>
                    <Preview src={value} alt={image.name} />
                    <span>{image.name}</span>
                    <ExternalLink asDiv>Change image</ExternalLink>
                </>
            ) : (
                <>
                    <Icon />
                    <span>drag and drop your image (png,jpeg)</span>
                    <ExternalLink asDiv>Select image</ExternalLink>
                </>
            )}
            <StyledInput
                {...getInputProps()}
                required={required && !value}
                ref={(el: HTMLInputElement | null) => {
                    inputRef.current = el;

                    if (typeof typedDropzoneRef === 'function') {
                        typedDropzoneRef(el);
                    } else if (
                        typedDropzoneRef &&
                        typeof typedDropzoneRef === 'object' &&
                        'current' in typedDropzoneRef
                    ) {
                        (
                            typedDropzoneRef as React.MutableRefObject<HTMLInputElement | null>
                        ).current = el;
                    }
                }}
            />
        </Container>
    );
};

export default ImageInput;
