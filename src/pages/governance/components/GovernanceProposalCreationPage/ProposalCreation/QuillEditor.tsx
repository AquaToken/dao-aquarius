import Quill from 'quill/core';
import { AlignStyle } from 'quill/formats/align';
import Blockquote from 'quill/formats/blockquote';
import Bold from 'quill/formats/bold';
import CodeBlock from 'quill/formats/code';
import Header from 'quill/formats/header';
import Indent from 'quill/formats/indent';
import Italic from 'quill/formats/italic';
import Link from 'quill/formats/link';
import List from 'quill/formats/list';
import Script from 'quill/formats/script';
import Strike from 'quill/formats/strike';
import Underline from 'quill/formats/underline';
import Clipboard from 'quill/modules/clipboard';
import Toolbar from 'quill/modules/toolbar';
import Snow from 'quill/themes/snow';
import { useEffect, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';
import styled from 'styled-components';

import { COLORS } from 'web/styles';

Quill.register(AlignStyle, true);

Quill.register(Bold, true);
Quill.register(Italic, true);
Quill.register(Underline, true);
Quill.register(Strike, true);
Quill.register(Header, true);
Quill.register(List, true);
Quill.register(Blockquote, true);
Quill.register(CodeBlock, true);
Quill.register(Link, true);
Quill.register(Script, true);
Quill.register(Indent, true);

Quill.register('modules/toolbar', Toolbar);
Quill.register('modules/clipboard', Clipboard);
Quill.register('themes/snow', Snow);

const EditorWrapper = styled.div<{ focused: boolean }>`
    .ql-toolbar {
        box-sizing: border-box;
        border-radius: 0.5rem 0.5rem 0 0;
        border-color: ${COLORS.gray100};
        border-bottom-color: ${({ focused }) => (focused ? COLORS.purple500 : COLORS.gray100)};
        border-bottom-width: ${({ focused }) => (focused ? '0.2rem' : '0.1rem')};
    }

    .ql-container {
        box-sizing: border-box;
        border-radius: 0 0 0.5rem 0.5rem;
        border-color: ${({ focused }) => (focused ? COLORS.purple500 : COLORS.gray100)};
        border-width: ${({ focused }) => (focused ? '0.2rem' : '0.1rem')};
        padding: 1.2rem 1.5rem;
    }

    .ql-editor {
        width: 100%;
        min-height: 30rem;
        box-sizing: content-box;
        border: ${({ focused }) => (focused ? 'none' : '0.1rem solid transparent')};
        font-size: 1.6rem;
        line-height: 2.8rem;
        padding: 0;
    }
`;

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'link',
    'blockquote',
    'code-block',
    'list',
    'bullet',
    'check',
    'script',
    'indent',
    'direction',
    'size',
    'font',
    'align',
];

const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],

    ['blockquote', 'code-block'],

    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],

    ['link'],
];

const QuillEditor = ({ value, onChange }: QuillEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const [focused, setFocused] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (editorRef.current && !quillRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow',
                placeholder: 'Insert content here...',
                modules: {
                    toolbar: toolbarOptions,
                },
                formats,
            });

            const quill = quillRef.current;

            quill.on('text-change', () => {
                const html = quill.root.innerHTML;
                onChange(html);
            });

            quill.root.innerHTML = value;

            quill.root.addEventListener('focus', () => setFocused(true));
            quill.root.addEventListener('blur', () => setFocused(false));

            setInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (initialized && quillRef.current && value !== quillRef.current.root.innerHTML) {
            quillRef.current.root.innerHTML = value;
        }
    }, [value, initialized]);

    return (
        <EditorWrapper focused={focused}>
            <div ref={editorRef} />
        </EditorWrapper>
    );
};

export default QuillEditor;
