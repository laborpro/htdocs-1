<?php
/**
 * Created by PhpStorm.
 * User: root
 * Date: 26.02.2017
 * Time: 15:07
 */
class Controller_creator extends Controller{

    public function exec_default(){
        // запускаем тестовый метод
        $selector = $this->model->select_one();
        $this->view = str_replace('%creator%', $selector, $this->view);
    }




    public function select_event($post_data){
        // Записываем массив с даннми в модель;
        $this->model->post_array = $post_data;
        // Вызываем метод показа всего дерева
        $this->model->select_event();
    }

    public function create_form($post_data){
        // Записываем массив с даннми в модель;
        $this->model->post_array = $post_data;
        // Вызываем метод показа всего дерева
        $result = $this->model->create_form();
        // возврат в форму
        $this->view = str_replace('%creator%', $result, $this->view);
    }

    public function button_plus($post_data){
        // Записываем массив с даннми в домель;
        $this->model->post_array = $post_data;
        // Вызываем метод показа всего дерева
        $this->model->button_plus();
    }

    public function new_type_select($post_data){
        // Записываем массив с даннми в домель;
        $this->model->post_array = $post_data;
        // Вызываем метод показа всего дерева
        $this->model->new_type_select();
    }
    public function save_new_type_select($post_data){
        // Записываем массив с даннми в домель;
        $this->model->post_array = $post_data;
        // Вызываем метод показа всего дерева
        $this->model->save_new_type_select();
    }

}