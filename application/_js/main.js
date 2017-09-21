$(document).ready(function() {
    var left_key=0;
    var right_key =0;
    var dol =  "";
    var dir =  "";
    var name = "";
    var doc = "";
    var select_item = "";
    var observer_em = "";
    var select_item_em= "";
    var group = "";
    var time_from = "";
    var time_to = "";
    var file_id= "";
    var local_id = "";
    var action_type = "";
    start();
    //
    //var ua = navigator.userAgent,
    //pickclick = (ua.match(/iPad/i) || ua.match(/iPhone/)) ? "touchstart" : "click";


    $(document).on("click",'.open_list_report',function(){
        if($(".open_list_report").hasClass("open_dept")){
            $(".open_list_report").removeClass("open_dept");

            $("#test_report .node_report").addClass('none');
            $('#test_report .node_report>.progress-group').addClass('none');
        } else {
            $(".open_list_report").addClass("open_dept");

            $("#test_report .node_report").removeClass('none');
            $('#test_report .node_report>.progress-group').removeClass('none');

            // плавные переход к открывшемуся блоку
            var destination = $("#test_report").offset().top;
            jQuery("html:not(:animated),body:not(:animated)").animate({scrollTop: destination}, 800);
            return false;

        }
    });




    $(document).on('click','#doc_circle',function(){
        if($("#doc_circle").hasClass("open_depd")){
            $("#doc_circle").removeClass("open_depd");

            $("#doc_report .node_report").addClass('none');
            $('#doc_report .node_report>.progress-group').addClass('none');
        } else {
            $("#doc_circle").addClass("open_depd");

            $("#doc_report .node_report").removeClass('none');
            $('#doc_report .node_report>.progress-group').removeClass('none');
        }
    });




    $(document).on('click','#look_dep',function(){
        $(".node_report").removeClass('none');
        $("#look_dep").addClass('none');
        $("#close_dep").removeClass('none');
        $('.node_report>.progress-group').removeClass('none');
    });

    $(document).on('click','#look_dep_all',function(){
        $(".node_report").removeClass('none');
        $('.progress-group').removeClass('none');
        $('.node_report>.progress-group').addClass("look_on");
        $('.node_report>.progress-group').removeClass("look_off");
        $("#look_dep_all").addClass('none');
        $("#close_dep").removeClass('none');
        $("#look_dep").addClass('none');
    });

    $(document).on('click','#close_dep',function(){
        $('.progress-group').addClass('none');
        $(".node_report").addClass('none');
        $("#look_dep").removeClass('none');
        $("#close_dep").addClass('none');
        $("#look_dep_all").removeClass('none');
        $('.node_report>.progress-group').addClass("look_off");
        $('.node_report>.progress-group').removeClass("look_on");

    });


    // логика дашборда по отделам
    // расскрываем отдел
    $(document).on('click','.look_off',function() {
        $(this).addClass("look_on");
        $(this).removeClass("look_off");
        var parent = $(this).closest(".parent");

        $(parent).children('.progress-group').removeClass('none');
    });
    // сворачеваем отдел
    $(document).on('click','.look_on',function() {
        $(this).addClass("look_off");
        $(this).removeClass("look_on");

        var parent = $(this).closest(".parent");
        $(parent).children('.progress-group').addClass('none');
    });


    // выбор подразделения

    $(document).on("click", "#select_node", function () {
        $("#popup_context_menu_update").removeClass("none");
        var emp_id = "";
        var report_type = "org_str_tree";
        $.ajax({
            type: "POST",
            url: "/master_report/main",
            data: {
                emp_id:emp_id,
                report_type: report_type
            },
            success: function (answer) {
                var result = jQuery.parseJSON(answer);
                var request_result = result.status;
                var request_message = result.message;
                var content = result.content;
                // если 'ok' - рисуем тест
                if(request_result == 'ok'){

                    $("body").css("margin-top","0px");
                    $('#test_block').fadeIn(0);
                    $('#popup_update_tree').html(content);
                    $(".tree_item").addClass("none");
                    $(".tree_item_fio").addClass("none");
                    $("html, body").animate({ scrollTop: 0 }, 0);
                    $("#tree_main>ul").removeClass("none");
                    // присваеваем классы дня непустых элементов
                    $(".tree_item").each(function() {
                        var parent = $(this).parent("li");
                        if(parent.children('ul').length != 0){
                            $(this).addClass("open_item");
                        }
                    });
                    $(".open_item").closest("ul").removeClass("none");
                    $(".open_item").removeClass("none");

                }
            },
            error: function () {
                console.log('error');
            }
        });
    });



    $(document).on("click", "#cancel_popup", function () {
        $("#popup_context_menu_update").addClass("none");
    });

    $(document).on("click", ".tree_item", function () {
        $("#popup_context_menu_update").addClass("none");

        $("#nods_key").attr('left',$(this).attr('left_key'));
        $("#nods_key").attr('right',$(this).attr('right_key'));
        start();
    });

    $(document).on("click", "#all_node_popup", function () {
        $("#popup_context_menu_update").addClass("none");

        $("#nods_key").attr('left',"");
        $("#nods_key").attr('right',"");
        start();
    });



    function start() {
        var node_left_key = $("#nods_key").attr('left');
        var node_right_key = $("#nods_key").attr('right');
        $.ajax({
            type: "POST",
            url: "/main/start",
            data: {
                node_left_key:node_left_key,
                node_right_key:node_right_key
            },
            success: function (answer) {

                var result = jQuery.parseJSON(answer);
                var request_result = result.status;
                var content = result.content;

                if(request_result == 'ok'){
                    $("#load_dashboard").html(content);
                    create_node_structure();
                }// if
                if(request_result == 'not company'){
                    window.location = "/company_control";
                }// if
            },
            error: function () {
                console.log('error');
            }
        });// ajax
    }

    function create_node_structure(){
        // создание дашборда по отделам
        // тестированние
        $("#test_node_report .progress-group").each(function() {
            var parent_level = 0;
            var parent_left = 0;
            var parent_right = 0;
            var count_child = 0;
            var parent = $(this);
            var fact = 0;
            var  target = 0;
            fact = Number(parent.attr('fact'));
            target = Number(parent.attr('target'));
            parent_level = $(this).attr('level');
            parent_left = $(this).attr('left_key');
            parent_right = $(this).attr('right_key');
            $('#test_node_report .progress-group').each(function() {
                child_left = 0;
                child_right = 0;
                child_left = $(this).attr('left_key');
                child_right = $(this).attr('right_key');
                if ((parent_left < child_left)&&(parent_right > child_right)){
                    $(this).addClass('none');
                    $(this).detach().appendTo(parent);
                    fact += Number($(this).attr('fact'));
                    target += Number($(this).attr('target'));
                    ++count_child;
                }
                //$(this).append("<br> " + parent_left + "<"+ child_left+" : " + parent_right + ">" + child_right);
            });
            // выводим суммарную цыфру по отделам
            $('.progress-text-row>.progress-number:first',this).html("<b>"+ fact +"</b>/" + target);
            var width_proc = (Math.round(fact/target*100)) + "%";
            $('.progress-bar:first',this).css("width",width_proc);

            if(count_child>0){
                $(this).addClass("parent");
                $('.progress-text',this).addClass("look_off");
            } else {
                $(this).addClass("last");
            }
        });
        // cтавим администрацию на первое место
        $("#test_node_report .progress-group").each(function() {
            var level = $(this).attr('level');
            var left = $(this).attr('left_key');
            if ((level ==  1)&&(left>002)){
                $(this).detach().appendTo("#test_node_report");
            }
        });

        // у кого нет потомков идите в конце
        $("#test_node_report .progress-group").each(function() {
            var level = $(this).attr('level');
            var left = $(this).attr('left_key');
            if ((level ==  1)&&(!($(this).hasClass("parent")))){
                $(this).detach().appendTo("#test_node_report");
            }
        });



        // сотрудники
        $("#doc_node_report .progress-group").each(function() {
            var parent_level = 0;
            var parent_left = 0;
            var parent_right = 0;
            var count_child = 0;
            var parent = $(this);
            var fact = 0;
            var  target = 0;
            fact = Number(parent.attr('fact'));
            target = Number(parent.attr('target'));
            parent_level = $(this).attr('level');
            parent_left = $(this).attr('left_key');
            parent_right = $(this).attr('right_key');
            $('#doc_node_report .progress-group').each(function() {
                child_left = 0;
                child_right = 0;
                child_left = $(this).attr('left_key');
                child_right = $(this).attr('right_key');
                if ((parent_left < child_left)&&(parent_right > child_right)){
                    $(this).addClass('none');
                    $(this).detach().appendTo(parent);
                    fact += Number($(this).attr('fact'));
                    target += Number($(this).attr('target'));
                    ++count_child;
                }
                //$(this).append("<br> " + parent_left + "<"+ child_left+" : " + parent_right + ">" + child_right);
            });
            // выводим суммарную цыфру по отделам
            $('.progress-text-row>.progress-number:first',this).html("<b>"+ fact +"</b>/" + target);
            var width_proc = (Math.round(fact/target*100)) + "%";
            $('.progress-bar:first',this).css("width",width_proc);

            if(count_child>0){
                $(this).addClass("parent");
                $('.progress-text',this).addClass("look_off");
            } else {
                $(this).addClass("last");
            }
        });

        $("#doc_node_report .progress-group").each(function() {
            var level = $(this).attr('level');
            var left = $(this).attr('left_key');
            if ((level ==  1)&&(left>002)){
                $(this).detach().appendTo("#doc_node_report");
            }
        });
        // у кого нет потомков идите в конце
        $("#doc_node_report .progress-group").each(function() {
            var level = $(this).attr('level');
            var left = $(this).attr('left_key');
            if ((level ==  1)&&(!($(this).hasClass("parent")))){
                $(this).detach().appendTo("#doc_node_report");
            }
        });

    }


    // открываем и закрываем сотрудников
    $(document).on('click','.icon',function(){
        var parent = $(this).closest(".people");
        if($(this).hasClass("open_people")){
             $(".fio_box",parent).addClass("none");
            $(this).removeClass("open_people");
        } else {
            $(".fio_box",parent).removeClass("none");
            $(this).addClass("open_people");
        }
    });

    // показать/скрываем отчёт по сотруднику
    $(document).on('click','.people_report',function(){
        var emp_id = $(this).attr('emp_id');
        var all_content = "";
        var report_type = "test_doc";
        $.ajax({
            type: "POST",
            url: "/master_report/main",
            data: {
                emp_id:emp_id,
                report_type: report_type
            },
            success: function (answer) {
                var result = jQuery.parseJSON(answer);
                var request_result = result.status;
                var content = result.content;
                if (request_result == "ok") {
                    $("#popup_report_emp_content").html(content);
                    $("#popup_report_emp").removeClass("none");
                }
            }
        });

    });

    $(document).on('click','#ok_popup_report_emp',function(){
        $("#popup_report_emp").addClass("none");
    });
    $(document).on('click','#link_docs_report',function(){
        window.location = "/local_alert ";
    });


    $(document).on("click", ".alert_row", function () {
        dol =  $(this).attr("dol");
        dir =  $(this).attr("dir");
        name =  $(this).attr("name");
        doc =  $(this).attr("doc");
        file_id =  $(this).attr("file_id");
        observer_em =  $(this).attr("observer_em");
        local_id =  $(this).attr("local_id");
        action_type =  $(this).attr("action_type");
        observer_em = $(this).attr("observer_em");
        if( action_type == 10 ){
            $("#alert_signature_docs_popup").removeClass("none");
            $("#emp_report_name").html(name);
            $("#dolg_report_name").html(dol);
            $("#dolg_report_dir").html(dir);
            $("#docs_report_name").html(doc);
        }
        if( action_type == 12 ){
            $("#alert_acception_docs_popup").removeClass("none");
            $("#emp_acception_name").html(name);
            $("#dolg_acception_name").html(dol);
            $("#dolg_acception_dir").html(dir);
            $("#docs_acception_name").html(doc);
        }
        if( action_type == 14 ){
            $("#alert_bailee_push_popup").removeClass("none");
            $("#emp_bailee_push_name").html(name);
            $("#dolg_bailee_push_name").html(dol);
            $("#dolg_bailee_push_dir").html(dir);
            $("#docs_bailee_push_name").html(doc);
        }

    });

// отправляем на исполнение в forms и передаём нужные параметры
    $(document).on("click", "#yes_popup_3", function () {
        var la_real_form_id = file_id;
        var la_employee = observer_em;

        var action_name = "secretary_signature_action";

        $.ajax({
            type: "POST",
            url: "/distributor/main",
            data: {
                la_real_form_id:la_real_form_id,
                la_employee:la_employee,
                action_name:action_name,
                observer_em:observer_em,
                local_id:local_id
            },
            success: function (answer) {

                var result = jQuery.parseJSON(answer);
                var form_actoin_set = result.form_actoin;
                var la_employee_set = result.la_employee;
                var la_real_form_id_set = result.la_real_form_id;
                var observer_em_set = result.observer_em;

                $(".alert_row").each(function() {
                    if(la_real_form_id_set == $(this).attr("file_id")){
                        $(this).closest("li").css("display","none");
                    }
                });
                $("#alert_signature_docs_popup").addClass("none");
            },
            error: function () {
                console.log('error');
            }
        });// ajax
    });

    // отправляем на исполнение в forms и передаём нужные параметры
    $(document).on("click", "#yes_popup_4", function () {
        var la_real_form_id = file_id;
        var la_employee = observer_em;

        var action_name = "secretary_get_doc_action";

        $.ajax({
            type: "POST",
            url: "/distributor/main",
            data: {
                la_real_form_id:la_real_form_id,
                la_employee:la_employee,
                action_name:action_name,
                observer_em:observer_em,
                local_id:local_id
            },
            success: function (answer) {

                var result = jQuery.parseJSON(answer);
                var form_actoin_set = result.form_actoin;
                var la_employee_set = result.la_employee;
                var la_real_form_id_set = result.la_real_form_id;
                var observer_em_set = result.observer_em;

                $(".alert_row").each(function() {
                    if(la_real_form_id_set == $(this).attr("file_id")){
                        $(this).closest("li").css("display","none");
                    }
                });
                $("#alert_acception_docs_popup").addClass("none");
            },
            error: function () {
                console.log('error');
            }
        });// ajax
    });

    // отправляем на исполнение в forms и передаём нужные параметры
    $(document).on("click", "#yes_popup_14", function () {
        var la_real_form_id = file_id;
        var la_employee = observer_em;

        var action_name = "bailee_action";

        $.ajax({
            type: "POST",
            url: "/distributor/main",
            data: {
                la_real_form_id:la_real_form_id,
                la_employee:la_employee,
                action_name:action_name,
                observer_em:observer_em,
                local_id:local_id
            },
            success: function (answer) {

                var result = jQuery.parseJSON(answer);
                var form_actoin_set = result.form_actoin;
                var la_employee_set = result.la_employee;
                var la_real_form_id_set = result.la_real_form_id;
                var observer_em_set = result.observer_em;

                $(".alert_row").each(function() {
                    if(la_real_form_id_set == $(this).attr("file_id")){
                        $(this).closest("li").css("display","none");
                    }
                });
                $("#alert_bailee_push_popup").addClass("none");
            },
            error: function () {
                console.log('error');
            }
        });// ajax
    });

    // отмена действия
    $(document).on("click", ".cancel_popup", function () {
        $("#alert_signature_docs_popup").addClass("none");
        $("#alert_acception_docs_popup").addClass("none");
        $("#alert_bailee_push_popup").addClass("none");
        $("#popup_context_menu_update").css("display","none");
        $("#emp_report_name").html("");
        $("#dolg_report_name").html("");
        $("#dolg_report_dir").html("");
        $("#docs_report_name").html("");
        $("#popup_update_tree").attr("left_key", "");
        $("#popup_update_tree").attr("right_key", "");
        dol =  "";
        dir =  "";
        name = "";
        doc = "";
    });

    $(document).on("click", "#search_local_alert", function () {

        var search_string = $("#search_local_alert_input").val();
        var report_type = "local_alert_journal";

        $.ajax({
            type: "POST",
            url: "/master_report/main",
            data: {
                report_type:report_type,
                search_string:search_string
            },
            success: function (answer) {

                var result = jQuery.parseJSON(answer);
                var content = result.content;
                var status = result.status;


                if(status == "ok"){
                    $("#ul_alert_journal").html(content);
                }

            },
            error: function () {
                console.log('error');
            }
        });// ajax

    });

    //$("#menu_open_closer").click();


$(".fc-day-grid-container").css("height","100%");


});