<?php
/**
 * Created by PhpStorm.
 * User: Filipp
 * Date: 10.08.17
 * Time: 14:57
 */

class class_node {

    public  function MoveNode($move_item,$new_parent,$company_id){
        global $db;

        // получаем ключи элемента
        $sql = "SELECT *
                FROM organization_structure
                WHERE organization_structure.id=". $move_item;
        $result = $db->row($sql);
        $left_key = $result['left_key'];
        $right_key = $result['right_key'];
        // получаем ключи старого родителя
        $sql="SELECT organization_structure.parent, parent_org.left_key, parent_org.right_key
                FROM organization_structure
                LEFT JOIN organization_structure AS parent_org ON parent_org.id = organization_structure.parent
                WHERE organization_structure.id =".$move_item ;
        $result = $db->row($sql);
        $old_parent = $result['parent'];
        $old_parent_left_key = $result['left_key'];
        $old_parent_right_key = $result['right_key'];
        // получаем ключи нового родителя
        $sql = "SELECT *
                FROM organization_structure
                WHERE organization_structure.id=". $new_parent;
        $result = $db->row($sql);
        $new_parent_left_key = $result['left_key'];
        $new_parent_right_key = $result['right_key'];
        if(($left_key<=$new_parent_left_key)&&($right_key>=$new_parent_right_key)){

            echo "нельзы переносить в самого себя";
        } else {


            // получаем раздницу по левелам
            $sql = "SELECT old_parent.`level` - new_parent.`level` AS level_delta
                FROM organization_structure AS new_parent, organization_structure AS old_parent
                WHERE new_parent.id = " . $new_parent . "
                AND old_parent.id = " . $old_parent;
            $result = $db->row($sql);
            $level_delta = $result['level_delta'];

            // Внешняя дельта - для применения к неперемещаемым узлам = количество перемещаемых ключей)))
            $external_delta = $right_key - $left_key + 1;

            // начинаем перемешение //
            // если идём вверх по ключам
            if ($old_parent_left_key < $new_parent_left_key) {
                // получили дельту для применения к внутренним перемещаемого элементам узла
                $new_right_key = $new_parent_right_key - 1;
                $delta = $new_right_key - $right_key;
                $new_left_key = $left_key + $delta;

                // поменяли ключи у неперемещаемых узлов по пути следования перемещаемого узла
                $sql = "UPDATE `organization_structure` SET `left_key` = `left_key` - {$external_delta} WHERE `left_key` > {$right_key}  AND `left_key` < {$new_parent_right_key}  AND `company_id` = {$company_id}";
                $db->query($sql);
                $sql = "UPDATE `organization_structure` SET `right_key` = `right_key` - {$external_delta} WHERE `right_key` > {$right_key}  AND `right_key` < {$new_parent_right_key}  AND `company_id` = {$company_id};";
                $db->query($sql);

                // меняем ключи у перемещаемого узла и его потомков
                $sql = "UPDATE `organization_structure` SET `left_key` = {$left_key} + {$delta},`right_key` = {$right_key} + {$delta}  WHERE `left_key` >= {$left_key}  AND `right_key` <= {$right_key}  AND `company_id` = {$company_id};";
                $db->query($sql);

            } else { // если идём вниз по ключам
                // получили дельту для применения к внутренним перемещаемого элементам узла
                $new_right_key = $new_parent_right_key - 1;
                $delta = $right_key - $new_right_key;
                $new_left_key = $left_key - $delta;

                // поменяли ключи у неперемещаемых узлов по пути следования перемещаемого узла
                $sql = "UPDATE `organization_structure` SET `left_key` = `left_key` + {$external_delta} WHERE `left_key` >= {$new_parent_right_key}  AND `left_key` < {$left_key}  AND `company_id` = {$company_id}";
//                 echo $sql;
                $db->query($sql);
                $sql = "UPDATE `organization_structure` SET `right_key` = `right_key` + {$external_delta} WHERE `right_key` >= {$new_parent_right_key}  AND `right_key` < {$left_key}  AND `company_id` = {$company_id};";
//                echo $sql;
                $db->query($sql);
                // меняем ключи у перемещаемого узла и его потомков
                $sql = "UPDATE `organization_structure` SET `left_key` = {$left_key} - {$delta},`right_key` = {$right_key} - {$delta}  WHERE `left_key` >= {$left_key}  AND `right_key` <= {$right_key}  AND `company_id` = {$company_id};";
                $db->query($sql);
            }

            // присваеваю родителя перемещаемому узлу
            $sql = "UPDATE `organization_structure` SET `parent` = {$new_parent} WHERE `id` = {$move_item}";
            $db->query($sql);

            // расставляем правельные левелы
            $sql = "UPDATE organization_structure SET `level` = `level` - ". $level_delta ."
                WHERE left_key >= " . $new_left_key . "
                AND right_key <= " . $new_right_key;
//            echo $sql;
            $db->query($sql);
        }
    }


    public function DeleteNode($delete_item,$company_id){
        global $db;
        $sql = "SELECT *
                FROM organization_structure
                WHERE organization_structure.id=". $delete_item;
        $result = $db->row($sql);
        $left_key = $result['left_key'];
        $right_key = $result['right_key'];



        $sql="DELETE FROM `organization_structure` WHERE `left_key` >= {$left_key} AND `right` <= {$right_key} AND `company_id` = {$company_id};
                  UPDATE `organization_structure` SET `left_key` = `left_key` - {$right_key} + {$left_key} - 1 WHERE `left_key` > {$right_key} AND `company_id` = {$company_id};
                  UPDATE `organization_structure` SET `right_key` = `right_key` - {$right_key} + {$left_key} - 1 WHERE `right_key` > {$right_key} AND `company_id` = {$company_id};";
//        echo $sql;
//        $db->query($sql);
    }

    // функция добавление элемента в дерево компании
    public  function InsertNode($new_parent_id,$company_id,$kladr_id,$items_control_id,$boss_type){
        global $db;
        $sql = "SELECT *
                FROM organization_structure
                WHERE organization_structure.id=". $new_parent_id;
        $result = $db->row($sql);
//        $left_key = $result['left_key'];
        $right_key = $result['right_key'];
        $parent_level = $result['level'];

        // добавляем в конец списка
        $sql="UPDATE `organization_structure` SET `left_key` = `left_key` + 2 WHERE `left_key` > {$right_key} AND `company_id` = {$company_id};
                UPDATE `organization_structure` SET `right_key` = `right_key` + 2 WHERE `right_key` >= {$right_key} AND `company_id` = {$company_id};
                INSERT INTO `organization_structure` SET `left_key` = {$right_key},
                                                        `right_key` = {$right_key} + 1,
                                                        `company_id` = {$company_id},
                                                        `kladr_id` = {$kladr_id},
                                                        `items_control_id` = {$items_control_id},
                                                        `boss_type` = {$boss_type},
                                                        `level` = {$parent_level } + 1,
                                                         `parent`={$new_parent_id} ;";
//        echo $sql;
//        $db->query($sql);
    }


    public function TreeCheck($company_id){
        global $db;

        $sql="SELECT * FROM organization_structure WHERE left_key >= right_key AND company_id =".$company_id;
        $result = $db->row($sql);
        $error_item = $result['id'];
        if($error_item!=""){
            echo "Тест №1: Ошибка при запросе - ". $sql ."<br>";
        } else {
            echo "Тест №1: В дереве не найдено ошибок <br>";
        }

        $sql="SELECT
                       t1.*
                FROM
                       organization_structure AS t1,
                       organization_structure AS t2
                WHERE
                       t1.left_key = t2.right_key AND t1.company_id = ". $company_id ." AND t2.company_id =". $company_id;
        $result = $db->row($sql);
        $error_item = $result['id'];
        if($error_item!=""){
            echo "Тест №2: Ошибка при запросе - ". $sql ."<br>";
        } else {
            echo "Тест №2: В дереве не найдено ошибок <br>";
        }

    }

    public  function creator_user_and_pass(){

        global $db, $labro;
        // если есть документ, если есть шаг, если сотрудник не уволен и если действие не завершено
        $sql = "SELECT * FROM employees WHERE id >= 73";

        // перенос утсраевших строк в историю
        $users_array = $db->all($sql);

        foreach ($users_array as $key => $user_array) {
            $pass = $labro->generate_password();
//            $login = $labro->generate_password();
            $role = 3;
            $login = str_ireplace('(SOBAKA)','@',$user_array['email']);
            $sql = "INSERT INTO `users` (         `name`,
                                                  `password`,
                                                  `role_id`,
                                                  `employee_id`,
                                                  `full_name`) VALUES (
                                                   '" . $login. "',
                                                   '" . $pass . "',
                                                   '" . $role. "',
                                                   '" . $user_array['id'] . "',
                                                   '" . $user_array['surname'] . "');";
            $db->query($sql);
        }
    }

    public  function lock_company($id_company){
        global $db;
//    $sql = "SELECT * FROM lock_org_str WHERE id_lock_company =". $id_company;
        $sql = "UPDATE `lock_org_str` SET `status` = 1 WHERE `id_lock_company` = {$id_company}";
        $db->query($sql);
    }

    public  function unlock_company($id_company){
        global $db;
        $sql = "UPDATE `lock_org_str` SET `status` = 0 WHERE `id_lock_company` = {$id_company}";
        $db->query($sql);
    }

}