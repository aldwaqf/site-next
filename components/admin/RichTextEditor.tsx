'use client';

// Éditeur de contenu riche (TipTap) pour le back-office.
// Produit du HTML propre stocké dans le champ body des contenus :
// titres, paragraphes, gras, listes, citations, images et vidéos YouTube.

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import { CldUploadWidget } from 'next-cloudinary';
import {
    Bold, Italic, Heading2, Heading3, List, ListOrdered,
    Quote, ImagePlus, Video, Undo2, Redo2, Minus,
} from 'lucide-react';

const cloudinaryReady = Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
);

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    dir?: 'ltr' | 'rtl';
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, dir = 'ltr' }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [2, 3] } }),
            TiptapImage.configure({ HTMLAttributes: { class: 'rounded-xl' } }),
            Youtube.configure({ width: 640, height: 360, HTMLAttributes: { class: 'rounded-xl w-full aspect-video h-auto' } }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                dir,
                class: 'prose prose-neutral max-w-none min-h-48 px-4 py-3 focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    if (!editor) {
        return <div className="h-48 border border-neutral-200 rounded-xl animate-pulse bg-neutral-50" />;
    }

    const addYoutube = () => {
        const url = window.prompt('Lien de la vidéo YouTube :');
        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    };

    const btn = (active: boolean) =>
        `p-2 rounded-lg transition-colors ${active ? 'bg-emerald-100 text-emerald-700' : 'text-neutral-500 hover:bg-neutral-100'}`;

    return (
        <div className="border border-neutral-200 rounded-xl overflow-hidden focus-within:border-emerald-500">
            <div className="flex flex-wrap items-center gap-1 border-b border-neutral-100 bg-neutral-50 px-2 py-1.5">
                <button type="button" title="Titre" className={btn(editor.isActive('heading', { level: 2 }))}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    <Heading2 className="w-4 h-4" />
                </button>
                <button type="button" title="Sous-titre" className={btn(editor.isActive('heading', { level: 3 }))}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                    <Heading3 className="w-4 h-4" />
                </button>
                <span className="w-px h-5 bg-neutral-200 mx-1" />
                <button type="button" title="Gras" className={btn(editor.isActive('bold'))}
                    onClick={() => editor.chain().focus().toggleBold().run()}>
                    <Bold className="w-4 h-4" />
                </button>
                <button type="button" title="Italique" className={btn(editor.isActive('italic'))}
                    onClick={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic className="w-4 h-4" />
                </button>
                <span className="w-px h-5 bg-neutral-200 mx-1" />
                <button type="button" title="Liste à puces" className={btn(editor.isActive('bulletList'))}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}>
                    <List className="w-4 h-4" />
                </button>
                <button type="button" title="Liste numérotée" className={btn(editor.isActive('orderedList'))}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}>
                    <ListOrdered className="w-4 h-4" />
                </button>
                <button type="button" title="Citation" className={btn(editor.isActive('blockquote'))}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}>
                    <Quote className="w-4 h-4" />
                </button>
                <button type="button" title="Séparateur" className={btn(false)}
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <Minus className="w-4 h-4" />
                </button>
                <span className="w-px h-5 bg-neutral-200 mx-1" />
                {cloudinaryReady && (
                    <CldUploadWidget
                        signatureEndpoint="/api/upload/signature"
                        options={{ folder: 'site-next/articles', maxFiles: 1, resourceType: 'image' }}
                        onSuccess={(result) => {
                            const info = result?.info;
                            if (info && typeof info === 'object' && 'secure_url' in info) {
                                editor.chain().focus().setImage({ src: info.secure_url as string }).run();
                            }
                        }}
                    >
                        {({ open }) => (
                            <button type="button" title="Insérer une image" className={btn(false)} onClick={() => open()}>
                                <ImagePlus className="w-4 h-4" />
                            </button>
                        )}
                    </CldUploadWidget>
                )}
                <button type="button" title="Insérer une vidéo YouTube" className={btn(false)} onClick={addYoutube}>
                    <Video className="w-4 h-4" />
                </button>
                <span className="flex-1" />
                <button type="button" title="Annuler" className={btn(false)}
                    onClick={() => editor.chain().focus().undo().run()}>
                    <Undo2 className="w-4 h-4" />
                </button>
                <button type="button" title="Rétablir" className={btn(false)}
                    onClick={() => editor.chain().focus().redo().run()}>
                    <Redo2 className="w-4 h-4" />
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
