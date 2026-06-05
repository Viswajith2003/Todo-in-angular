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
  ReactiveFormsModule
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
  clearFormat
} from 'roosterjs';

@Component({
  selector: 'app-rooster-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef<HTMLDivElement>;

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

  // Formatting operations
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
