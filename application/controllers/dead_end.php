<?php
/**
 * Created by PhpStorm.
 * User: root
 * Date: 26.02.2017
 * Time: 15:07
 */
class Controller_dead_end extends Controller{
    // model, view и pointer - объявлены в родительском классе;
    // если тестировщик тогда даём возможность сбросить
    public function exec_default(){
        $test_test = $this->model->test();
        $this->view = str_replace('%test_test%', $test_test, $this->view);

    }
    // сброс данных для тестировщика
    public function reset_progress(){
        // Записываем массив с даннми в домель;
        $this->model->post_array = $this->post_params;
        // функция сброса
        $this->model->reset_progress();
    }


    public function cron(){
        $this->model->cron();
    }

    public function phpexcel(){
        $this->model->phpexcel();
    }
}