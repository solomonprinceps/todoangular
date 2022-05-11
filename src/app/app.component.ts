
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, } from '@angular/forms';
import { BackendService } from './appservices/backend.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Todo } from './todo';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('dropListContainer') dropListContainer?: ElementRef;
  @ViewChild('singleRequestModalRef') singleRequestModalRef: ElementRef | null = null;
  
  createtodo: FormGroup;
  isLoadingIn: Boolean = false;
  page_number: Number = 10;
  status: any = null;
  todos:Todo[] = [] 
  activetodos:Todo[] = []
  completedtodos:Todo[] = []
  singletodo: any;
  title = 'appBootstrap';
  closeResult: string = '';
  dropListReceiverElement?: HTMLElement;
  dragDropInfo?: {
    dragIndex: number;
    dropIndex: number;
  };

  // add() {
  //   this.completedtodos.push(this.completedtodos.length + 1);
  // }
  
  

  constructor( private modalService: NgbModal, private fb: FormBuilder, private backend: BackendService, private loadingBar: LoadingBarService, private toastr: ToastrService) {
    this.createtodo = this.fb.group({
      title: [null, [Validators.required]],
      description: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.loadList()
    this.completedloadList()
    this.activeloadList()
  }
  

  changeStatus(status:any) {
    this.status = status
    this.loadList()
  }

  resetform() {
    this.createtodo.reset();
  }

  open(content:any) {

    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {

      this.closeResult = `Closed with: ${result}`;

    },(res) => {
      const data = `Dismissed ${this.getDismissReason(res)}`;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  close(content:any) {
    this.modalService.dismissAll();
  }



  get formControls() {
    return this.createtodo.controls;
  }

  movebackend(data:any, index:any) {
    if (data == "cdk-drop-list-1") {
      const id = this.activetodos[index].id;
      this.completeTodo(id)
    }

    if (data == "cdk-drop-list-0") {
      const id = this.completedtodos[index].id;
      this.movectiveTodo(id)
    }

  }


  drop(event: CdkDragDrop<Todo[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      this.movebackend(event.container.id, event.previousIndex);
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  viewOne(data:any) {
    this.loadingBar.start();
    this.backend.singletodo(data).subscribe((data: any) => {
      this.singletodo = data.todo
      this.open(this.singleRequestModalRef);
      this.loadingBar.complete();
    }, (e) => {
      this.loadingBar.complete();
      this.singletodo = null
      this.toastr.error(e.error.message)
    })
  }

  clearTodos() {
    if (this.isLoadingIn) {
      return
    }
    this.loadingBar.start();
    this.isLoadingIn = true
    this.backend.clearCompleted().subscribe((data: any) => {
      this.isLoadingIn = false
      this.toastr.success(data.message)
      this.loadingBar.complete();
      this.loadList()
      this.completedloadList()
      this.activeloadList()
    }, (e) => {
      this.loadingBar.complete();
      this.isLoadingIn = false
      this.toastr.error(e.error.message)
    })
  }

  deleteTodo(data:any) {
    if (this.isLoadingIn) {
      return
    }
    this.loadingBar.start();
    this.isLoadingIn = true
    this.backend.deletetodo(data).subscribe((data: any) => {
      this.isLoadingIn = false
      this.toastr.success(data.message)
      this.loadList()
      this.completedloadList()
      this.activeloadList()
      this.close(this.singleRequestModalRef)
      this.loadingBar.complete();
    }, (e) => {
      this.loadingBar.complete();
      this.isLoadingIn = false
      this.close(this.singleRequestModalRef)
      this.singletodo = null
      this.toastr.error(e.error.message)
    })
  }

  completeTodo(data:any) {
    if (this.isLoadingIn) {
      return
    }
    this.loadingBar.start();
    this.isLoadingIn = true
    this.backend.completetodo(data).subscribe((data: any) => {
      this.toastr.success(data.message)
      this.isLoadingIn = false
      this.loadList()
      this.activeloadList()
      this.completedloadList()
      this.close(this.singleRequestModalRef)
      this.loadingBar.complete();
    }, (e) => {
      this.loadingBar.complete();
      this.isLoadingIn = false
      this.close(this.singleRequestModalRef)
      this.singletodo = null
      this.toastr.error(e.error.message)
    })
  }

  movectiveTodo(data:any) {
    if (this.isLoadingIn) {
      return
    }
    this.loadingBar.start();
    this.isLoadingIn = true
    this.backend.movetoactive(data).subscribe((data: any) => {
      this.toastr.success(data.message)
      this.isLoadingIn = false
      this.loadList()
      this.activeloadList()
      this.completedloadList()
      this.close(this.singleRequestModalRef)
      this.loadingBar.complete();
    }, (e) => {
      this.loadingBar.complete();
      this.isLoadingIn = false
      this.close(this.singleRequestModalRef)
      this.singletodo = null
      this.toastr.error(e.error.message)
    })
  }

  loadList() {
    const data = {
      "page_number": this.page_number,
      "status": this.status
    };
    this.loadingBar.start();
    this.backend.listTodos(data).subscribe((data: any) => {
      this.todos = data.todos 
      this.loadingBar.complete();
    }, (e) => {
      this.loadingBar.complete();
      this.todos = []
    })
  }

  activeloadList() {
    const data = {
      "page_number": this.page_number,
      "status": "0",
    };
    this.loadingBar.start();
    this.backend.listTodos(data).subscribe((data: any) => {
      this.activetodos = data.todos 
      this.loadingBar.complete();
    }, (e) => {
      this.loadingBar.complete();
      this.activetodos = []
    })
  }

  completedloadList() {
    const data = {
      "page_number": this.page_number,
      "status": "1",
    };
    this.loadingBar.start();
    this.backend.listTodos(data).subscribe((data: any) => {
      this.completedtodos = data.todos 
      this.loadingBar.complete();
    }, (e) => {
      this.loadingBar.complete();
      this.completedtodos = []
    })
  }


  paginate(url:any) {
    const data = {
      "page_number": this.page_number,
      "status": this.status
    };
    this.loadingBar.start();
    this.backend.paginate(data, url).subscribe((data: any) => {
      this.todos = data.todos
      this.loadingBar.complete();
    }), (error: any) => {
      if (error instanceof HttpErrorResponse) {
        this.loadingBar.complete();
        this.toastr.error('Error Occoured', error.error.message);
      }
    };
  }

  handleSubmit() {
    Object.values(this.formControls).forEach(control => {
      control.markAsDirty();
      control.updateValueAndValidity();
    });
    if (this.createtodo.valid) {
      this.isLoadingIn = true;
      this.createtodo.disable();
      this.loadingBar.start();
      this.backend.createTodo(this.createtodo.value).subscribe((data: any) => {
        this.loadingBar.complete();
        this.isLoadingIn = false
        this.createtodo.enable();
        this.resetform()
        this.loadList()
        this.completedloadList()
        this.activeloadList()
        this.toastr.success('Success', data.message);
      }), (error: any) => {
        this.loadingBar.complete();
        this.createtodo.enable();
        this.isLoadingIn = false;
        this.toastr.error('Error Occoured', error.error.message);
      };
    }
  }  

}
