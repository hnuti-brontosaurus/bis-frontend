import { forwardRef } from 'react'
import { ControllerRenderProps } from 'react-hook-form'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.core.css'
import 'react-quill/dist/quill.snow.css'
import styles from './RichTextEditor.module.scss'

const RichTextEditor = forwardRef<
  any,
  ControllerRenderProps<any, string> & { placeholder: string }
>((props, ref) => (
  <ReactQuill
    className={styles.wrapper}
    theme="snow"
    modules={{
      toolbar: ['bold', { list: 'ordered' }, { list: 'bullet' }, 'link'],
    }}
    formats={['bold', 'list', 'bullet', 'link']}
    {...props}
    ref={ref}
  />
))

export default RichTextEditor

const strip = (html: string): string => {
  let doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

export const htmlRequired =
  (required: string | boolean) =>
  (value: string = '') =>
    !required || strip(value).trim().length > 0 || required
