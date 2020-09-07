import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Comment } from '../shared/comment';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { FormBuilder, FormGroup, Validators, Form } from '@angular/forms';

@Component({
    selector: 'app-dishdetail',
    templateUrl: './dishdetail.component.html',
    styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

    dish: Dish;
    dishIds: string[];
    dishcopy: Dish;
    prev: string;
    next: string;
    comment: Comment;
    errMess: string;

    @ViewChild('cform') commentFormDirective;
    commentForm: FormGroup;

    formErrors = {
        'author': '',
        'comment': '',
    };

    validationMessages = {
        'author': {
            'required':      'Author is required.',
            'minlength':     'Author must be at least 2 characters long.'
        },
        'comment': {
            'required':      'Last Name is required.'
        },
    };

    constructor(private dishservice: DishService,
        private route: ActivatedRoute,
        private location: Location,
        private fb: FormBuilder,
        @Inject('BaseURL') private BaseURL) {
            this.createForm();
        }

    ngOnInit(): void {
        // const id = this.route.snapshot.params['id'];
        // this.dishservice.getDish(id.toString())
        // .subscribe((dish) => this.dish = dish);
        this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
        this.route.params.pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
        .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); },
        errmess => this.errMess = <any>errmess);
        }

    setPrevNext(dishId: string) {
        const index = this.dishIds.indexOf(dishId);
        this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
        this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
    }

    goBack(): void {
        this.location.back();
    }

    createForm() {
        this.commentForm = this.fb.group({
            author: ['', [Validators.required, Validators.minLength(2)]],
            rating: [5],
            comment: ['', Validators.required ],
        });
        this.commentForm.valueChanges
            .subscribe(data => this.onValueChanged(data));

        this.onValueChanged(); // (re)set validation messages now
    }

    onValueChanged(data?: any) {
        if (!this.commentForm) { return; }
        const form = this.commentForm;
        for (const field in this.formErrors) {
            if (this.formErrors.hasOwnProperty(field)) {
                // clear previous error message (if any)
                this.formErrors[field] = '';
                const control = form.get(field);
                if (control && control.dirty && !control.valid) {
                const messages = this.validationMessages[field];
                for (const key in control.errors) {
                    if (control.errors.hasOwnProperty(key)) {
                    this.formErrors[field] += messages[key] + ' ';
                    }
                }
                }
            }
            }
        }

    onSubmit() {
        var date = new Date();
        var stringDate = date.toISOString();
        // console.log(this.commentForm.value.author);
        // this.comment.author = this.commentForm.value.author;
        // this.comment.rating = this.commentForm.value.rating;
        // this.comment.comment = this.commentForm.value.comment;
        this.comment = this.commentForm.value;
        this.comment.date = stringDate;
        this.dishcopy.comments.push(this.comment);
        this.dishservice.putDish(this.dishcopy)
        .subscribe(dish => {
            this.dish = dish;
            this.dishcopy = dish;
        },
        errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
        console.log(this.comment);
        this.commentForm.reset({
            author: '',
            rating: 5,
            comment: '',
        });
        this.commentFormDirective.resetForm();
    }
}
