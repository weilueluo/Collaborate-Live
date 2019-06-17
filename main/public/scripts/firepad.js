

// Create ACE
var editor = ace.edit("firepad-container");
editor.setTheme("ace/theme/ambiance");
// AMBIENCE IS GOOD
// GITHUB
// Chrome is also fair.
// editor.setTheme("ace/theme/textmate");  // ORIGINAL THEME
var session = editor.getSession();
session.setUseWrapMode(true);
session.setUseWorker(false);
session.setMode("ace/mode/java");

var javaDefault = "//java coding yeah\n"
                + "import java.util.Scanner;\n"
                + "public class Run {\n"
                + "  public static void main(String[] args) {\n"
                + "    System.out.println(\"Hello World!\");\n"
                + "    System.out.println(args[0]);\n"
                + "    System.out.println((new Scanner(System.in)).nextInt());"
                + "    \n"
                + "  }\n"
                + "}";
// Create Firepad.
const firepad = Firepad.fromACE(ref, editor, {
  defaultText: javaDefault
});


function setTheme(index) {
  editor.setTheme("ace/theme/" + themes[index]);
}

function setCode(index) {
  session.setMode('ace/mode/' + codes[index]);
  $('#code-language-button').text(codes[index]);
}

var $themebutton = $('#theme-button');
var $codebutton = $('#code-language-button');

var themelock = false;
$themebutton.click(() => {
  if (!themelock) {
    themelock = true;
    toggleThemes(() => {
      themelock = false;
    });
  }
});

var codelock = false;
$codebutton.click(() => {
    if (!codelock) {
      codelock = true;
      toggleCode(() => {
        codelock = false;
      });
    }
});

var $themeopts = $('#themes-options');
var $codeopts = $('#code-language-options');
var themeOpened = false;
var codeOpened = false;

function toggleThemes(callback) {
  themeOpened = !themeOpened;//NOTE: THIS IS INVERTED FIRST TO PREVENT COLLISION
  $('#themes-options li').each(function(index) {
    var $li = $(this);
    setTimeout(() => {
      if(!themeOpened) {
        $li.css('transition', '0.3s');
        $li.css('height', '0%');
        setTimeout(() => {
          $li.css('margin', '0');
          $li.css('width', '0%');
        }, 400);
      } else {
        $li.css('transition', 'width 0s, height 0.3s');
        $li.css('height', '5%');
        $li.css('margin', '5%');
        $li.css('width', '90%');
        if(codeOpened) {
          toggleCode();
        }
      }
    }, index * 50);
  });

  setTimeout(callback, 400);
}

function toggleCode(callback) {
  codeOpened = !codeOpened;//NOTE: THIS IS INVERTED FIRST TO PREVENT COLLISION
  $('#code-language-options li').each(function(index) {
    var $li = $(this);
    setTimeout(() => {
      if(!codeOpened) {
        $li.css('transition', '0.3s');
        $li.css('height', '0%');
        setTimeout(() => {
          $li.css('margin', '0');
          $li.css('width', '0%');
        }, 400);
      } else {
        $li.css('transition', 'width 0s, height 0.3s');
        $li.css('height', '5%');
        $li.css('margin', '5%');
        $li.css('width', '90%');
        if(themeOpened) {
          toggleThemes();
        }
      }
    }, index * 50);
  });
  setTimeout(callback, 400);
}
