import {
  Component,
  ElementRef,
  ViewChild,
  forwardRef,
  OnDestroy,
  AfterViewInit,
  Input,
  OnInit
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EditorAdapter } from 'roosterjs-editor-adapter';
import {
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrikethrough,
  toggleBullet,
  toggleNumbering,
  setAlignment,
  clearFormat,
  insertImage,
  insertTable,
  editTable
} from 'roosterjs';

@Component({
  selector: 'app-rooster-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './rooster-editor.html',
  styleUrl: './rooster-editor.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RoosterEditorComponent),
      multi: true
    }
  ]
})
export class RoosterEditorComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  @Input() control?: FormControl;
  @Input() placeholder = 'Type your content here...';

  // Modal states
  showModal = false;
  modalType: 'image' | 'video' | 'table' = 'image';
  modalTitle = '';
  modalInputLabel = '';
  modalInputValue = '';
  modalRows = 3;
  modalCols = 3;

  // Image upload states
  imageSourceType: 'url' | 'upload' = 'url';
  selectedFileName = '';
  selectedFileBase64 = '';

  // Video upload states
  videoSourceType: 'url' | 'upload' = 'url';
  selectedVideoName = '';
  selectedVideoBase64 = '';

  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef<HTMLDivElement>;

  openImageModal() {
    this.modalType = 'image';
    this.modalTitle = 'Insert Image';
    this.modalInputLabel = 'Image Source URL';
    this.modalInputValue = '';
    this.imageSourceType = 'url';
    this.selectedFileName = '';
    this.selectedFileBase64 = '';
    this.showModal = true;
  }

  openVideoModal() {
    this.modalType = 'video';
    this.modalTitle = 'Insert Video';
    this.modalInputLabel = 'Video Source URL';
    this.modalInputValue = '';
    this.videoSourceType = 'url';
    this.selectedVideoName = '';
    this.selectedVideoBase64 = '';
    this.showModal = true;
  }

  openTableModal() {
    this.modalType = 'table';
    this.modalTitle = 'Insert Table';
    this.modalRows = 3;
    this.modalCols = 3;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedFileName = '';
    this.selectedFileBase64 = '';
    this.selectedVideoName = '';
    this.selectedVideoBase64 = '';
  }

  onImageFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedFileBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onVideoFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedVideoName = file.name;

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedVideoBase64 = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  confirmModal() {
    if (!this.editor) return;

    if (this.modalType === 'image') {
      if (this.imageSourceType === 'url') {
        const url = this.modalInputValue.trim();
        if (url) {
          insertImage(this.editor, url);
        }
      } else if (this.imageSourceType === 'upload') {
        if (this.selectedFileBase64) {
          insertImage(this.editor, this.selectedFileBase64);
        }
      }
    } else if (this.modalType === 'video') {
      let src = '';
      if (this.videoSourceType === 'url') {
        src = this.modalInputValue.trim();
      } else if (this.videoSourceType === 'upload') {
        src = this.selectedVideoBase64;
      }

      if (src) {
        const videoNode = document.createElement('video');
        videoNode.src = src;
        videoNode.controls = true;
        videoNode.style.maxWidth = '100%';
        videoNode.style.display = 'block';
        videoNode.style.margin = '0.5rem 0';
        videoNode.style.borderRadius = '8px';
        this.editor.insertNode(videoNode);
      }
    } else if (this.modalType === 'table') {
      const r = Math.max(1, Math.min(20, this.modalRows));
      const c = Math.max(1, Math.min(20, this.modalCols));
      insertTable(this.editor, c, r);
    }

    this.closeModal();
  }

  execTableOp(op: string) {
    if (this.editor) {
      editTable(this.editor, op as any);
    }
  }

  private editor?: EditorAdapter;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private initialValue = '';
  private isUpdating = false;

  ngOnInit() {
    // If a FormControl was passed directly as Input, subscribe to it
    if (this.control) {
      this.control.valueChanges.subscribe(val => {
        this.updateEditorValue(val);
      });
    }
  }

  ngAfterViewInit() {
    const plugin: any = {
      getName: () => 'AngularBindingPlugin',
      initialize: (editorInstance: any) => {
        this.editor = editorInstance as EditorAdapter;
      },
      dispose: () => {
        this.editor = undefined;
      },
      onPluginEvent: (event: any) => {
        if (event.eventType === 'contentChanged') {
          if (!this.isUpdating) {
            const html = this.editor?.getContent() || '';
            this.onChange(html);
            if (this.control && this.control.value !== html) {
              this.control.setValue(html, { emitEvent: false });
            }
          }
        }
      }
    };

    this.editor = new EditorAdapter(this.editorContainer.nativeElement, {
      plugins: [plugin],
      defaultSegmentFormat: {
        fontFamily: 'Plus Jakarta Sans, system-ui, -apple-system, sans-serif',
        fontSize: '12pt',
        textColor: '#f3f4f6'
      }
    });

    const valToSet = this.control ? (this.control.value || '') : this.initialValue;
    if (valToSet) {
      this.editor.setContent(valToSet);
    }
  }

  private updateEditorValue(val: any) {
    const html = val || '';
    if (this.editor && this.editor.getContent() !== html) {
      this.isUpdating = true;
      this.editor.setContent(html);
      this.isUpdating = false;
    }
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    const val = value || '';
    if (this.editor) {
      this.updateEditorValue(val);
    } else {
      this.initialValue = val;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (this.editorContainer) {
      this.editorContainer.nativeElement.contentEditable = isDisabled ? 'false' : 'true';
    }
  }


  execBold() {
    if (this.editor) {
      toggleBold(this.editor);
    }
  }

  execItalic() {
    if (this.editor) {
      toggleItalic(this.editor);
    }
  }

  execUnderline() {
    if (this.editor) {
      toggleUnderline(this.editor);
    }
  }

  execStrikethrough() {
    if (this.editor) {
      toggleStrikethrough(this.editor);
    }
  }

  execBullet() {
    if (this.editor) {
      toggleBullet(this.editor);
    }
  }

  execNumbering() {
    if (this.editor) {
      toggleNumbering(this.editor);
    }
  }

  execAlignLeft() {
    if (this.editor) {
      setAlignment(this.editor, 'left');
    }
  }

  execAlignCenter() {
    if (this.editor) {
      setAlignment(this.editor, 'center');
    }
  }

  execAlignRight() {
    if (this.editor) {
      setAlignment(this.editor, 'right');
    }
  }

  execClearFormat() {
    if (this.editor) {
      clearFormat(this.editor);
    }
  }

  execUndo() {
    if (this.editor) {
      this.editor.undo();
    }
  }

  execRedo() {
    if (this.editor) {
      this.editor.redo();
    }
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.dispose();
      this.editor = undefined;
    }
  }
}
