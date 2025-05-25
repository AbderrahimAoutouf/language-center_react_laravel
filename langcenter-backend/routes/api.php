<?php

use App\Http\Controllers\LoginController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InscrireClassController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\EtudiantController;
use App\Http\Controllers\CoursController;
use App\Http\Controllers\StudentsAttendanceController;
use App\Http\Controllers\DaysController;
use App\Http\Controllers\ReceiptController;


use App\Http\Controllers\TimeTablesController;
use App\Models\time_tables;

use App\Http\Controllers\ClassroomController;
use App\Models\Classroom;
use Illuminate\Support\Facades\Http;

use App\Http\Controllers\RegisterTestController;
use App\Http\Controllers\TestPaymentController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ExpensesController;
use App\Http\Controllers\TeacherSalaryController;

use App\Http\Controllers\HolidayController;

Route::post('/login', [LoginController::class, 'login']);


Route::post('/login', [LoginController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [LoginController::class, 'logout']);
    Route::apiResource('users', UserController::class);
});

Route::apiResource('etudiants', EtudiantController::class);
Route::apiResource('inscrire-classes', InscrireClassController::class);

Route::put('/classes/{class_}', 'App\Http\Controllers\ClassController@update');
Route::get('/classes', 'App\Http\Controllers\ClassController@index');
Route::post('/classes', 'App\Http\Controllers\ClassController@store');
Route::get('/classes/{class_}', 'App\Http\Controllers\ClassController@show');
Route::delete('/classes/{class_}', 'App\Http\Controllers\ClassController@destroy');
Route::get('/classes/{class}/students', [ClassController::class, 'getStudents']);
Route::get('/etudiants/{id}/receipt', [EtudiantController::class, 'generateReceipt']);

Route::put('/cours/{cours}', 'App\Http\Controllers\CoursController@update');
Route::get('/cours', 'App\Http\Controllers\CoursController@index');
Route::post('/cours', 'App\Http\Controllers\CoursController@store');
Route::get('/cours/{cours}', 'App\Http\Controllers\CoursController@show');
Route::delete('/cours/{cours}', 'App\Http\Controllers\CoursController@destroy');

Route::post('/inscrires/{id}/register-payment', [InscrireClassController::class, 'registerPayment']);
Route::put('/update-payment/{id}', [InscrireClassController::class, 'updatePayment']);
Route::delete('/delete-payment/{id}/', [InscrireClassController::class, 'deletePayment']);
//teacher api
// Route::apiResource('teachers', TeacherController::class);
Route::get('/teachers', 'App\Http\Controllers\TeacherController@index');
Route::post('/teachers', 'App\Http\Controllers\TeacherController@store');
Route::get('/teachers/{teacher}', 'App\Http\Controllers\TeacherController@show');
Route::put('/teachers/{teacher}', 'App\Http\Controllers\TeacherController@update');
Route::delete('/teachers/{teacher}', 'App\Http\Controllers\TeacherController@destroy');
Route::patch('/teachers/{teacher}/toggle-active', [TeacherController::class, 'toggleActive']);
Route::post('/teachers/{teacher}/avatar', [TeacherController::class, 'updateAvatar']);
//parent api
Route::get('/parents', 'App\Http\Controllers\ParentController@index');
Route::put('parents/{parent_}', 'App\Http\Controllers\ParentController@update');
Route::get('/parents/{parent_}', 'App\Http\Controllers\ParentController@show');
Route::apiResource('parents', ParentController::class);
Route::post('/parents/search', [ParentController::class, 'search']);
Route::patch('/parents/{parent}/archive', [ParentController::class, 'archive']);


// Timetable routes
Route::post('/timeTable', 'App\Http\Controllers\TimeTablesController@store');
Route::get('/timeTable', 'App\Http\Controllers\TimeTablesController@index');
Route::get('/timeTable/{id}', 'App\Http\Controllers\TimeTablesController@show');
Route::put('/timeTable/{timeTable}', 'App\Http\Controllers\TimeTablesController@update');
Route::delete('/timeTable/{timeTable}', 'App\Http\Controllers\TimeTablesController@destroy');
//Route::get('/timeTable', [TimeTableController::class, 'index']);
//Route::get('/timetable/class/{class_id}', 'TimetableController@getClassTimetable');


// Receipt routes

// Création d'un reçu
Route::post('/receipts', [ReceiptController::class, 'store'])
     ->middleware('auth:sanctum'); // Si vous utilisez l'authentification

// Génération PDF
Route::get('/receipts/{id}/pdf', [ReceiptController::class, 'generatePdf'])
     ->middleware('auth:sanctum');


//days
Route::get('/days', 'App\Http\Controllers\DaysController@index');
Route::get('/days/{id}', 'App\Http\Controllers\DaysController@show');

// Classroom routes
Route::resource('/classroom', ClassroomController::class);
Route::get('/classroom', 'App\Http\Controllers\ClassroomController@index');
Route::get('/classroom/{id}', 'App\Http\Controllers\ClassroomController@show');
Route::post('/classroom', 'App\Http\Controllers\ClassroomController@store');
Route::put('/classroom/{classroom}', 'App\Http\Controllers\ClassroomController@update');
Route::delete('/classroom/{classroom}', 'App\Http\Controllers\ClassroomController@destroy');
//number countroller
Route::get('/number', 'App\Http\Controllers\NumberController@index');

//presence Etudiant
Route::get('/studentsAttendance/{class_id}/', 'App\Http\Controllers\StudentsAttendanceController@show');
Route::get('/studentsAttendance', 'App\Http\Controllers\StudentsAttendanceController@index');
Route::post('/studentsAttendance/{class_id}', 'App\Http\Controllers\StudentsAttendanceController@store');
Route::put('/studentsAttendance/{class_id}', 'App\Http\Controllers\StudentsAttendanceController@update');
Route::delete('/studentsAttendance/{class_id}', 'App\Http\Controllers\StudentsAttendanceController@destroy');
Route::patch('/etudiants/{etudiant}/authorize-photo', [EtudiantController::class, 'authorizePhoto']);


//presence Teacher
Route::get('/teachersAttendance/{class_id}', 'App\Http\Controllers\TeachersAttendanceController@show');
Route::get('/teachersAttendance', 'App\Http\Controllers\TeachersAttendanceController@index');
Route::post('/teachersAttendance/{class_id}', 'App\Http\Controllers\TeachersAttendanceController@store');
Route::put('/teachersAttendance/{class_id}', 'App\Http\Controllers\TeachersAttendanceController@update');
Route::delete('/teachersAttendance/{class_id}', 'App\Http\Controllers\TeachersAttendanceController@destroy');

//levels api
Route::get('/levels', 'App\Http\Controllers\LanguageLevelController@index');
Route::post('/levels', 'App\Http\Controllers\LanguageLevelController@store');
Route::get('/levels/{level}', 'App\Http\Controllers\LanguageLevelController@show');
Route::put('/levels/{level}', 'App\Http\Controllers\LanguageLevelController@update');
Route::delete('/levels/{level}', 'App\Http\Controllers\LanguageLevelController@destroy');



//tests api
Route::get('/tests', 'App\Http\Controllers\TestsController@index');
Route::post('/tests', 'App\Http\Controllers\TestsController@store');
Route::get('/tests/{test}', 'App\Http\Controllers\TestsController@show');
Route::put('/tests/{test}', 'App\Http\Controllers\TestsController@update');
Route::delete('/tests/{test}', 'App\Http\Controllers\TestsController@destroy');
//getPayment for class
Route::post('/getPayment/{id}', 'App\Http\Controllers\ClassPayment@getPayment');

//assign level to student
Route::post('/assignLevel', 'App\Http\Controllers\AssignLevel@assignLevel');
//get level of student
Route::get('/getLevel/{id}', 'App\Http\Controllers\AssignLevel@getLevel');


//register student to test
Route::resource('/register', RegisterTestController::class);

//complet the payment
Route::resource('/testPayment', TestPaymentController::class);

//paymnet
Route::resource('/payment', PaymentController::class);

//expenses
Route::resource('/expenses', ExpensesController::class);

//teacher salaries
Route::resource('/salary', TeacherSalaryController::class);

//get hours
Route::post('/hours/{id}', 'App\Http\Controllers\TeacherHours@getTeacherHours');


//get earning and profit
Route::get('/profit', 'App\Http\Controllers\Netprofit@getProfit');


//Holidays 
Route::post('/holiday', [HolidayController::class, 'store']);
Route::get('/holiday', 'App\Http\Controllers\HolidayController@index');
Route::get('/holiday/{holiday}', [HolidayController::class, 'show']);
Route::put('/holiday/{holiday}', 'App\Http\Controllers\holidayController@update');
Route::delete('/holiday/{holiday}', 'App\Http\Controllers\holidayController@destroy');
